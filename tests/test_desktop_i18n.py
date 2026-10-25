"""桌面语言选择、持久化、通知与原生菜单行为。"""
import gettext
import os
import runpy
from pathlib import Path
import string
import tempfile
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from peach import desktop_i18n, tray, tray_diagnostics
from peach.settings_file import PROJECT_ROOT
from peach.versioning import VersionSnapshot


class DesktopLanguageTests(unittest.TestCase):
    def setUp(self):
        self.previous = desktop_i18n.language()
        self.addCleanup(desktop_i18n.set_language, self.previous)
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.preference = Path(temporary.name).resolve() / "desktop-language.txt"
        self.enterContext(patch.object(desktop_i18n, "preference_path", return_value=self.preference))
        self.enterContext(patch.dict(os.environ))
        os.environ.pop("PEACH_DESKTOP_LANGUAGE", None)

    def test_system_language_saved_choice_and_installer_override(self):
        with patch.object(desktop_i18n, "system_language", return_value="es"):
            self.assertEqual(desktop_i18n.initialize(), "es")
            desktop_i18n.set_language("en", persist=True)
            os.environ.pop("PEACH_DESKTOP_LANGUAGE")
            self.assertEqual(desktop_i18n.initialize(), "en")
            os.environ["PEACH_DESKTOP_LANGUAGE"] = "chs"
            self.assertEqual(desktop_i18n.initialize(), "zh-CN")
        self.assertEqual(self.preference.read_text(encoding="utf-8"), "en\n")

    def test_locale_variants_and_unsupported_language_fallback(self):
        for value, expected in (("es-MX", "es"), ("Spanish_Spain", "es"),
                                ("zh_CN", "zh-CN"), ("chs", "zh-CN"),
                                ("en-GB", "en"), ("fr-FR", "en"), (None, "en")):
            with self.subTest(value=value):
                self.assertEqual(desktop_i18n.normalize(value), expected)

    def test_non_windows_host_does_not_call_windows_locale_api(self):
        with patch.object(desktop_i18n.os, "name", "posix"), \
                patch.object(desktop_i18n.sys, "platform", "win32"), \
                patch.object(desktop_i18n.locale, "getlocale", return_value=("es_MX", "UTF-8")):
            self.assertEqual(desktop_i18n.system_language(), "es")

    def test_catalogs_preserve_fields_and_percent_placeholders(self):
        catalogs = []
        for language in ("en", "es"):
            translated = gettext.translation("desktop", PROJECT_ROOT / "resources/locales", languages=[language])
            messages = {key: value for key, value in translated._catalog.items() if key}
            catalogs.append(set(messages))
            self.assertGreaterEqual(len(messages), 250)
            for source, target in messages.items():
                with self.subTest(language=language, source=source):
                    fields = lambda value: [(name, spec, conv) for _, name, spec, conv in string.Formatter().parse(value) if name is not None]
                    self.assertEqual(sorted(fields(source)), sorted(fields(target)))
                    self.assertEqual(source.count("%s"), target.count("%s"))
                    self.assertFalse(any("\u4e00" <= char <= "\u9fff" for char in target))
        self.assertEqual(*catalogs)

    def test_dynamic_status_and_diagnostic_dialog_use_selected_language(self):
        for language, status, close in (("en", "Services stopped", "Close"),
                                         ("es", "Servicios detenidos", "Cerrar")):
            with self.subTest(language=language):
                desktop_i18n.set_language(language)
                self.assertEqual(tray.ServiceManager(()).status_summary(), status)
                self.assertIn(close.encode("utf-16-le"), tray_diagnostics._template(Path("report.zip")))
                rendered = desktop_i18n.tr("地址：{p0}", p0="https://example.invalid/中文")
                self.assertTrue(rendered.endswith("https://example.invalid/中文"))

    def test_windows_language_menu_changes_labels_without_restarting_services(self):
        desktop_i18n.set_language("en")
        versions = Mock()
        versions.inspect.return_value = VersionSnapshot("0.47.0", "release", "release", False, False, None)
        with patch.object(tray.pystray, "Icon"), patch.object(tray, "standalone", return_value=True):
            app = tray.PeachTray(tray.ServiceManager(()), versions=versions, windows_updates=Mock())
            self.assertIn("Quit Peach", [item.text for item in app._menu().items])
            with patch.object(app.manager, "stop_owned") as stop:
                app.language_action("es")()
            stop.assert_not_called()
            self.assertIn("Salir de Peach", [item.text for item in app.icon.menu.items])
            self.assertEqual(self.preference.read_text(encoding="utf-8"), "es\n")

    def test_localized_session_restores_the_callers_language(self):
        desktop_i18n.set_language("zh-CN")
        os.environ["PEACH_DESKTOP_LANGUAGE"] = "es"
        with desktop_i18n.session():
            self.assertEqual(desktop_i18n.tr("退出 Peach"), "Salir de Peach")
        self.assertEqual(desktop_i18n.tr("退出 Peach"), "退出 Peach")

    def test_installer_language_handoff_persists_only_supported_choices(self):
        entry = runpy.run_path(str(PROJECT_ROOT / "scripts/build_app_entry.py"))
        with patch("peach.remote_reporting.disable_for_process"):
            self.assertEqual(entry["installer_command"](["Peach.exe", "--installer-language", "es"]), 0)
            self.assertEqual(self.preference.read_text(encoding="utf-8"), "es\n")
            self.assertEqual(entry["installer_command"](["Peach.exe", "--installer-language", "invalid"]), 2)
            self.assertEqual(self.preference.read_text(encoding="utf-8"), "es\n")

    def test_macos_language_menu_rebuilds_translated_items(self):
        desktop_i18n.set_language("en")
        menu = Mock()
        menu_type = Mock(return_value=menu)
        gate = Mock(waiting=False)
        submenu = lambda items: SimpleNamespace(items=items)
        with patch.dict(sys.modules, {"peach.menubar": SimpleNamespace(MenuBarApp=menu_type, Submenu=submenu)}), \
                patch.object(tray, "standalone", return_value=True), \
                patch.object(tray, "VersionManager"), patch.object(tray, "create_icon"):
            tray.run_macos_menu_bar(Mock(specs=()), gate, silent=True)
            items = menu_type.call_args.args[2]
            self.assertIn("Quit Peach", [label for label, _ in items])
            languages = next(action for label, action in items if label == "Language / Idioma")
            spanish = next(action for label, action in languages.items() if label == "Español")
            spanish()
            self.assertIn("Salir de Peach", [label for label, _ in menu.set_items.call_args.args[0]])
            self.assertEqual(self.preference.read_text(encoding="utf-8"), "es\n")
