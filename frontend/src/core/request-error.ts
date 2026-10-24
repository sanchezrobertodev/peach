/** 请求失败使用统一的中文原因，不初始化界面或路由状态。 */
import { t as peachT } from "../i18n/index";
import { translateServerMessage } from '../i18n/server-message';
export function requestErrorMessage(cause:any,status=0):string{
  const text=String(cause?.message??cause??'');
  const code=Number(status||cause?.status||text.match(/\b(400|401|403|404|408|409|413|429|500|502|503|504)\b/)?.[1]);
  const messages:Record<number,string>={400:peachT("提交内容有误，请检查输入后重试。"),401:peachT("登录已失效，请刷新页面重新登录。"),403:peachT("当前设备没有执行此操作的权限，请在运行 Peach 的电脑上操作。"),404:peachT("请求的内容已不存在，请刷新列表。"),408:peachT("请求超时，请稍后重试。"),409:peachT("当前状态不允许此操作，请刷新后重试。"),413:peachT("提交内容过大，请减少数量后重试。"),429:peachT("请求过于频繁，请稍后重试。"),500:peachT("Peach 服务处理失败，请重试；持续失败时查看托盘日志。"),502:peachT("Peach 服务没有取回结果，请稍后重试；持续失败时查看托盘日志。"),503:peachT("Peach 服务暂时不可用，请稍后重试。"),504:peachT("等待服务响应超时，请稍后重试。")};
  if(/Failed to fetch|fetch failed|NetworkError|Load failed|network request failed|ERR_CONNECTION/i.test(text))return peachT("无法连接到 Peach 服务，请确认网络连接和托盘服务已启动。");
  /* 正文里的 timeout 字样只在没有状态码时才算超时：500 的堆栈里常带着某个库的 timeout 参数名。 */
  if(cause?.name==='TimeoutError'||(!code&&/timed? ?out|timeout/i.test(text)))return peachT("等待服务响应超时，请检查连接后重试。");
  if(/[㐀-鿿]/.test(text)&&!/^请求失败[（(]/.test(text))return translateServerMessage(text);
  if(messages[code])return messages[code];
  return peachT("操作未完成，请重试；持续失败时查看托盘日志。");
}
