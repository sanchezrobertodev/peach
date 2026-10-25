"""桌面界面的 gettext 词表与本机语言偏好。"""
from __future__ import annotations

import gettext
import locale
import os
import sys
from contextlib import contextmanager
from pathlib import Path


LANGUAGES = (("en", "English"), ("es", "Español"), ("zh-CN", "简体中文"))
_language = "zh-CN"
_translation = gettext.NullTranslations()


def normalize(value: str | None) -> str:
    name = (value or "").lower().replace("_", "-")
    if name.startswith(("es", "spanish")):
        return "es"
    if name.startswith(("zh", "chinese", "chs")):
        return "zh-CN"
    return "en"


def system_language() -> str:
    if os.name == "nt":
        import ctypes
        language_id = ctypes.windll.kernel32.GetUserDefaultUILanguage()
        return normalize(locale.windows_locale.get(language_id))
    if sys.platform == "darwin":
        try:
            from AppKit import NSLocale
            return normalize(str(NSLocale.preferredLanguages()[0]))
        except (ImportError, IndexError, AttributeError):
            pass
    return normalize(locale.getlocale()[0])


def preference_path() -> Path:
    from .distribution import user_data_root
    return user_data_root(os.environ) / "state" / "desktop-language.txt"


def initialize() -> str:
    choice = os.environ.get("PEACH_DESKTOP_LANGUAGE")
    if not choice:
        try:
            choice = preference_path().read_text(encoding="utf-8").strip()
        except OSError:
            pass
    return set_language(choice or system_language())


@contextmanager
def session():
    global _language, _translation
    previous = _language, _translation
    try:
        initialize()
        yield
    finally:
        _language, _translation = previous


def set_language(value: str, *, persist: bool = False) -> str:
    global _language, _translation
    language = normalize(value)
    from .settings_file import PROJECT_ROOT
    translation = (gettext.NullTranslations() if language == "zh-CN" else
                   gettext.translation("desktop", PROJECT_ROOT / "resources" / "locales",
                                       languages=[language]))
    if persist:
        from .fsutil import atomic_write_text
        path = preference_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        atomic_write_text(path, language + "\n")
        os.environ["PEACH_DESKTOP_LANGUAGE"] = language
    _language, _translation = language, translation
    return language


def language() -> str:
    return _language


def tr(message: str, **values) -> str:
    translated = _translation.gettext(message)
    return translated.format(**values) if values else translated
