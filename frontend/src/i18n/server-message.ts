import { t } from './index';

// 首启接口的动态提示：只翻译明确的协议文案，插值中的路径与名称原样保留。
const templates = [
  '未检测到 {{v0}}。', '下载 {{v0}}',
  '{{v0}} 是一个文件，Peach 数据目录要是目录',
  '目录不存在，或者不是目录：{{v0}}。先建好再填。',
  '{{v0}} 不是盘符路径；网络位置先映射成盘符再来',
  '和上面的 {{v0}} 重复了', '已经在 {{v0}} 里面，不用再加',
  '未找到 {{v0}}；转码、媒体信息与缩略图需要 FFmpeg 工具包。',
  '解压到 {{v0}}。', '未安装；缺索引的 MP4 需要它才修得了。解压到 {{v0}}。',
];
const patterns = templates.map((source) => ({ source, pattern: new RegExp('^' + source.split('{{v0}}')
  .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('([\\s\\S]+?)') + '$') }));

export function translateServerMessage(message: string): string {
  for (const { source, pattern } of patterns) {
    const match = pattern.exec(message);
    if (match) return t(source, { v0: match[1] });
  }
  return t(message);
}
