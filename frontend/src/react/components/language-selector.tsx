import { LANGUAGES, changeLanguage, locale, t } from '../../i18n';
import { Select, SelectItem } from '../boardui/components/base/select/select';

export function LanguageSelector() {
  return <Select aria-label={t('界面语言')} selectedKey={locale}
    onSelectionChange={(key) => {
      const language = LANGUAGES.find(({ id }) => id === key);
      if (language) changeLanguage(language.id);
    }}>
    {LANGUAGES.map(({ id, name }) => <SelectItem key={id} id={id} textValue={name}><span lang={id}>{name}</span></SelectItem>)}
  </Select>;
}
