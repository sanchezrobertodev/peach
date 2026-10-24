/** 首次采集的历史范围；值为提交给设置接口的天数，0 表示不限时间。 */
import { t as peachT } from "../i18n/index";
export const FOLLOW_INITIAL_RANGE_OPTIONS = [
  ['0', peachT("不限时间")],
  ['7', peachT("最近 7 天")],
  ['30', peachT("最近 30 天")],
  ['90', peachT("最近 90 天")],
] as const satisfies readonly (readonly [value: string, label: string])[];

export type InitialFollowRange = typeof FOLLOW_INITIAL_RANGE_OPTIONS[number][0];
