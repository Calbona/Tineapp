// engine\types.probe.ts —— 只读探针
// 用 data\ 全部样例 JSON 校验 types.ts 的类型定义：仅做类型断言，不读写任何数据
// 由 `npm run typecheck`（tsc --noEmit）覆盖
//
// 说明：resolveJsonModule 会把 JSON 中的数字/字符串字面量拓宽为 number/string，
// 因此这里用 Widen 把 types.ts 里的窄枚举（Gender/SpanType/TemplatePropertyValue）
// 还原为基础类型后再做结构校验；枚举值本身的合法范围由 Verify.md 负责。

import type {
  Character,
  Chronology,
  EnumEntry,
  Era,
  Event,
  EventTypeEntry,
  NewEntity,
  NewEntityTemplate,
  Organization,
  Regime,
  Region,
  Relationship,
  RelationshipTypeEntry,
  Tag,
  World
} from './types'

// 把窄枚举拓宽为基础类型，保留对象/数组结构（同态映射会保留索引签名与可选修饰符）
type Widen<T> = T extends number
  ? number
  : T extends string
    ? string
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T

import world0 from '../data/worlds/Cg0_Wd0.json'
import char0 from '../data/characters/Cg0_Wd0_Ch0.json'
import char1 from '../data/characters/Cg0_Wd0_Ch1.json'
import org0 from '../data/organizations/Cg0_Wd0_Og0.json'
import reg0 from '../data/regimes/Cg0_Wd0_Rm0.json'
import reg1 from '../data/regimes/Cg0_Wd0_Rm1.json'
import region0 from '../data/regions/Cg0_Wd0_Rg0.json'
import tag0 from '../data/tags/Cg0_Wd0_Tg0.json'
import ne0 from '../data/news/Cg0_Wd0_Nt0_Ne0.json'
import nt0 from '../data/registries/templates/Cg0_Wd0_Nt0.json'
import rel0 from '../data/relationships/Cg0_Wd0_Ch0_Rl0.json'
import cg1 from '../data/registries/chronologies/Cg1.json'

import ev_ch0_ev0 from '../data/EVENTS/Cg0_Wd0_Ch0_Ev0.json'
import ev_ch0_ev1 from '../data/EVENTS/Cg0_Wd0_Ch0_Ev1.json'
import ev_ch1_ev0 from '../data/EVENTS/Cg0_Wd0_Ch1_Ev0.json'
import ev_ch1_ev1 from '../data/EVENTS/Cg0_Wd0_Ch1_Ev1.json'
import er0 from '../data/EVENTS/Cg0_Wd0_Er0.json'
import ev_wd0 from '../data/EVENTS/Cg0_Wd0_Ev0.json'
import ev_wd0_ev1 from '../data/EVENTS/Cg0_Wd0_Ev0_Ev1.json'
import ev_og0 from '../data/EVENTS/Cg0_Wd0_Og0_Ev0.json'
import ev_rm0 from '../data/EVENTS/Cg0_Wd0_Rm0_Ev0.json'
import ev_rm1 from '../data/EVENTS/Cg0_Wd0_Rm1_Ev0.json'

import charType0 from '../data/registries/ENUMS/CharacterType_0.json'
import eventType7 from '../data/registries/ENUMS/EventType_7.json'
import orgType4 from '../data/registries/ENUMS/OrganizationType_4.json'
import regimeType5 from '../data/registries/ENUMS/RegimeType_5.json'
import relType6 from '../data/registries/ENUMS/RelationshipType_6.json'

// —— 断言每个样例 JSON 的结构都符合对应类型（枚举字段按基础类型校验） ——

world0 satisfies Widen<World>
char0 satisfies Widen<Character>
char1 satisfies Widen<Character>
org0 satisfies Widen<Organization>
reg0 satisfies Widen<Regime>
reg1 satisfies Widen<Regime>
region0 satisfies Widen<Region>
tag0 satisfies Widen<Tag>
ne0 satisfies Widen<NewEntity>
nt0 satisfies Widen<NewEntityTemplate>
rel0 satisfies Widen<Relationship>
cg1 satisfies Widen<Chronology>

ev_ch0_ev0 satisfies Widen<Event>
ev_ch0_ev1 satisfies Widen<Event>
ev_ch1_ev0 satisfies Widen<Event>
ev_ch1_ev1 satisfies Widen<Event>
er0 satisfies Widen<Era>
ev_wd0 satisfies Widen<Event>
ev_wd0_ev1 satisfies Widen<Event>
ev_og0 satisfies Widen<Event>
ev_rm0 satisfies Widen<Event>
ev_rm1 satisfies Widen<Event>

charType0 satisfies Widen<EnumEntry>
orgType4 satisfies Widen<EnumEntry>
regimeType5 satisfies Widen<EnumEntry>
eventType7 satisfies Widen<EventTypeEntry>
relType6 satisfies Widen<RelationshipTypeEntry>
