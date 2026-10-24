/* 本机端口与已保存媒体配置使用同一份修订号。 */
import { t as peachT } from "../../i18n/index";
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { LinkButton } from '@/components/base/buttons/link-button';
import { ApiError, apiSend, errorMessage } from '../../api';
import { CONFIGURATION_URL } from '../../configuration-endpoints';
import type { ConfigurationGroupProps } from '../bundle';
import { Note } from '../components/note';
import { RESTART_REDIRECT_MS } from '../restart-redirect';
import { Footer, Section, Stack } from './section';
import { busyProps, useAction } from './use-action';

export function PortSettings({ data, receipt }: ConfigurationGroupProps) {
  const [port, setPort] = useState(String(data.port));
  const [fieldError, setFieldError] = useState('');
  const [saved, setSaved] = useState<{ url: string } | null>(null);
  const action = useAction();
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => location.assign(saved.url), RESTART_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [saved]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError('');
    void action.run('save', (signal) => apiSend<{ url: string }>(CONFIGURATION_URL, {
      revision: data.revision, media_dirs: data.media_dirs,
      ...(data.media_sources ? { media_sources: data.media_sources } : {}),
      port, scan_now: false,
    }, 'POST', signal), (result) => { setSaved(result); receipt(peachT("已保存配置")); }, (cause) => {
      const fields = cause instanceof ApiError && cause.status === 400
        ? (cause.body as { errors?: { port?: string } } | null)?.errors : null;
      if (fields?.port) setFieldError(fields.port);
      else action.setError(errorMessage(cause));
    });
  };
  if (saved) return <Section title={peachT("本机访问端口")}><Stack>
    <Note tone="success" title={peachT("配置已保存")}>{peachT("Peach 正在重新启动。")}<LinkButton href={saved.url} size="small">{peachT("进入馆藏")}</LinkButton>
    </Note>
  </Stack></Section>;
  return <Section title={peachT("本机访问端口")} onSubmit={submit}><Stack>
    <Input id="configPort" label={peachT("端口")} inputMode="numeric" value={port} onChange={setPort}
      validationBehavior="aria" isInvalid={Boolean(fieldError)} hint={fieldError || undefined} />
    {action.error ? <Note tone="error" title={peachT("没有保存")}>{action.error}</Note> : null}
  </Stack><Footer status={peachT("保存后 Peach 会重启，并跳转到新地址。")}>
    <Button type="submit" {...busyProps(action.busy === 'save')}>{peachT("保存配置")}</Button>
  </Footer></Section>;
}
