import { t as peachT } from "../../../i18n/index";
import { translateServerMessage } from '../../../i18n/server-message';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';

import { busyProps } from '../../settings/busy-props';
import { describeFailure, restoreSetup, SetupRequestError, type SetupDone } from './setup-api';

export function SetupRestore({ onDone }: { onDone: (done: SetupDone) => void }) {
  const [path, setPath] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      onDone(await restoreSetup(path));
    } catch (cause) {
      const detail = cause instanceof SetupRequestError ? cause.errors?.data_root : undefined;
      setError(typeof detail === 'string' ? translateServerMessage(detail) : describeFailure(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <Input label={peachT("已有数据目录")} value={path} onChange={setPath} isRequired autoComplete="off" spellCheck="false"
        validationBehavior="aria" isInvalid={Boolean(error)}
        hint={error ? <span role="alert">{error}</span> : peachT("选择包含 config.toml 和 database 文件夹的数据目录。")} />
      <Button type="submit" className="self-start" {...busyProps(busy)}>{busy ? peachT("正在连接数据目录…") : peachT("使用此目录")}</Button>
    </form>
  );
}
