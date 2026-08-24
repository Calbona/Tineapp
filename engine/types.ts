// engine\types.ts —— 全仓唯一类型来源（见 harness\Modularization.md「TypeScript 模块」）
// 命名遵循「对象名 + JSON 同名键」；枚举用联合类型；ELEMENT 为组件数据，无独立路由类型

// ============================================================
// ELEMENT 元素（组件数据，不独立存在，是其他对象某个键的值）
// ============================================================

/** 对象唯一编号：物化路径，由对象代号用 '_' 连接（见 OBJECTS\ELEMENTS\Id.md） */
export type Id = string

/** 对象类型代号：物化路径首段，14 种固定（见 OBJECTS\ELEMENTS\Id.md） */
export type ObjectCode =
  | 'Ch' | 'Cg' | 'Ds' | 'Dc' | 'Er' | 'Ev' | 'Og'
  | 'Rm' | 'Rg' | 'Rl' | 'Wd' | 'Tg' | 'Nt' | 'Ne'

/** 关系类型的源→目标对象代号对，形如 `Og=>Rm`（见 OBJECTS\ENUMS\RelationshipType.md） */
export type ObjectCodePair = `${ObjectCode}=>${ObjectCode}`

/** 时间点：unit0 起连续的多级时间单位，值均为整数（见 OBJECTS\ELEMENTS\TimePoint.md） */
export interface TimePoint {
  unit0: number
  [unit: `unit${number}`]: number
}

// ============================================================
// ENUM 枚举
// ============================================================

/** 性别：0 女 / 1 男 / 2 其他 / 3 未知（硬编码，不可扩展） */
export type Gender = 0 | 1 | 2 | 3

/** 时间段类型：0 default / 1 instant / 2 lifelong / 3 eternal（硬编码，不可扩展） */
export type SpanType = 0 | 1 | 2 | 3

/** 角色类型（自然数，用户可注册，注册表见 data\registries\ENUMS\） */
export type CharacterType = number

/** 事件类型（自然数，用户可注册） */
export type EventType = number

/** 组织类型（自然数，用户可注册） */
export type OrganizationType = number

/** 政权类型（自然数，用户可注册） */
export type RegimeType = number

/** 关系类型（自然数，用户可注册） */
export type RelationshipType = number

/** 软件语言（9 种固定） */
export type Language =
  | 'de_DE'
  | 'en_US'
  | 'es_ES'
  | 'fr_FR'
  | 'ja_JP'
  | 'ko_KR'
  | 'ru_RU'
  | 'zh_CN'
  | 'zh_TW'

/** 语言映射：可注册枚举注册表条目的公共结构 */
export type LanguageMap = Record<Language, string>

/** 可注册枚举注册表条目的公共结构（CharacterType / OrganizationType / RegimeType 无 allow） */
export type EnumEntry = LanguageMap

/** 事件类型注册表条目：allow 为允许该事件所属的对象代号列表（必需） */
export type EventTypeEntry = LanguageMap & { allow: ObjectCode[] }

/** 关系类型注册表条目：allow 为允许的 `源=>目标` 对象代号对列表（必需） */
export type RelationshipTypeEntry = LanguageMap & { allow: ObjectCodePair[] }

// ============================================================
// ELEMENT 元素（续）
// ============================================================

/** 时间段：含起止 TimePoint 的闭区间，按 type 判别（见 OBJECTS\ELEMENTS\Span.md、OBJECTS\ENUMS\SpanType.md） */
export type Span =
  | { start: TimePoint; type: 0; end: TimePoint } // default：有起止，end 严格在 start 之后
  | { start: TimePoint; type: 1 } // instant：瞬时，起止相同，退化为一个点
  | { start: TimePoint; type: 2 } // lifelong：随上级对象生命周期结束
  | { start: TimePoint; type: 3 } // eternal：永不结束

/** 分段值：同一键在不同时间下取值不同，由若干 { value, span } 组成（见 OBJECTS\ELEMENTS\Piecewise.md） */
export type Piecewise<T> = Array<{
  value: T
  span: Span
}>

/** 属性值：number 或普通 string 或 Id（见 OBJECTS\ELEMENTS\Property.md） */
export type PropertyValue = number | string

/** 属性（见 OBJECTS\ELEMENTS\Property.md） */
export interface Property {
  key: string
  value: PropertyValue
}

/** 领土：若干 "x1, y1, x2, y2" 矩形区块字符串（见 OBJECTS\ELEMENTS\Territory.md） */
export type Territory = string[]

// ============================================================
// OBJECT 对象
// ============================================================

/** 历法（见 OBJECTS\CHRONOLOGIES\Chronology.md） */
export interface Chronology {
  id: Id
  chronology?: string
  unit0: Unit
  [unit: `unit${number}`]: Unit
}

/** 历法时间单位 */
export interface Unit {
  name: string
  initial?: number
  /** 必需，最后一个 Unit 例外 */
  default?: number
  [priority: `priority${number}`]: LeapRule
}

/** 闰规则（condition 为数字/数字数组/JS 表达式，subunit 可为数字或表达式，同 ChronologyJS） */
export interface LeapRule {
  condition: number | number[] | string
  subunit: number | string
}

/** 世界（见 OBJECTS\ENTITIES\World.md） */
export interface World {
  id: Id
  name: string
  properties?: Property[]
  mapscale: [number, number]
}

/** 角色（见 OBJECTS\ENTITIES\Character.md） */
export interface Character {
  id: Id
  name: string
  type?: CharacterType
  gender: Gender
  nationality: Piecewise<Id | null>
  properties?: Piecewise<Property[]>
}

/** 组织（见 OBJECTS\ENTITIES\Organization.md） */
export interface Organization {
  id: Id
  name: string
  type?: OrganizationType
  head: Piecewise<Id | null>
  properties?: Piecewise<Property[]>
}

/** 政权（见 OBJECTS\ENTITIES\Regime.md） */
export interface Regime {
  id: Id
  name: string
  type?: RegimeType
  head: Piecewise<Id | null>
  properties?: Piecewise<Property[]>
  territories: Piecewise<Territory>
}

/** 地区（见 OBJECTS\ENTITIES\Region.md） */
export interface Region {
  id: Id
  name: string
  properties?: Piecewise<Property[]>
  territories: Piecewise<Territory>
}

/** 标签（见 OBJECTS\ENTITIES\Tag.md） */
export interface Tag {
  id: Id
  name: string
  white: Id[]
  black: Id[]
}

/** 自定义实体模板（见 OBJECTS\ENTITIES\NewEntity.md） */
export interface NewEntityTemplate {
  id: Id
  name: string
  properties: TemplateProperty[]
}

/** 模板属性：声明 NewEntity 属性值的类型 */
export interface TemplateProperty {
  key: string
  value: TemplatePropertyValue
}

/** 模板属性值类型 */
export type TemplatePropertyValue = 'number' | 'string' | 'id' | 'span' | 'territory'

/** 自定义实体（见 OBJECTS\ENTITIES\NewEntity.md） */
export interface NewEntity {
  id: Id
  name: string
  properties: Piecewise<Property[]>
}

/** 事件（见 OBJECTS\EVENTS\Event.md） */
export interface Event {
  id: Id
  name: string
  type?: EventType
  span: Span
}

/** 时期（见 OBJECTS\EVENTS\Era.md） */
export interface Era {
  id: Id
  name: string
  properties?: Property[]
  span: Span
}

/** 关系（见 OBJECTS\RELATIONSHIPS\Relationship.md） */
export interface Relationship {
  id: Id
  target: Id
  type?: RelationshipType
  span: Span
}

/** 配置（见 OBJECTS\CONFIGS\Config.md，TOML 格式，无 JSON 样例） */
export interface Config {
  view: { m: 0 | 1 | 2 }
  language: { l: Language }
  verify: { T: number }
  palette: { ReNum: number; ReArray: string[]; RgNum: number; RgArray: string[] }
}
