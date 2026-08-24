## Purpose

为全局临时反馈建立稳定的跨端显示层级，确保用户在弹窗、抽屉或遮罩打开期间触发操作后，仍能及时看见 Toast 的结果提示。

## ADDED Requirements

### Requirement: 全局 Toast 显示在普通业务弹层之上

应用 SHALL 在普通业务弹层保持打开时，将全局 Toast 完整显示在弹层遮罩和内容面板之上，不得被遮挡或只露出局部内容。

#### Scenario: 添加饭搭子弹层内显示提示

- **GIVEN** 用户已打开“添加饭搭子”弹层
- **WHEN** 页面触发全局 Toast
- **THEN** Toast 完整显示在弹层遮罩和底部面板上方
- **AND** 添加饭搭子弹层保持原有打开状态

#### Scenario: 删除确认弹层内显示提示

- **GIVEN** 用户已打开成员或饭局删除确认弹层
- **WHEN** 页面触发全局 Toast
- **THEN** Toast 内容在确认弹层上方清晰可见
- **AND** Toast 不拦截或改变确认弹层的关闭与确认逻辑

### Requirement: 保持现有 Toast 调用兼容性

应用 SHALL 为未指定显示层级的全局 Toast 使用统一高层级默认值，同时 MUST 保留调用方显式指定层级、位置、时长和图标的能力。

#### Scenario: 使用默认配置显示 Toast

- **GIVEN** 调用方没有指定 Toast 显示层级
- **WHEN** 调用全局 Toast
- **THEN** Toast 使用高于普通业务弹层的默认层级
- **AND** 其位置、时长和关闭行为与现有默认行为一致

#### Scenario: 调用方覆盖显示层级

- **GIVEN** 调用方显式指定了 Toast 显示层级
- **WHEN** 调用全局 Toast
- **THEN** 应用使用调用方提供的层级
- **AND** 不强制替换为全局默认层级

### Requirement: 跨端显示行为一致

应用 SHALL 在 H5 与微信小程序中提供一致的 Toast 与普通业务弹层层级关系；平台渲染实现可以不同，但用户可观察结果不得不同。

#### Scenario: H5 与微信小程序弹层内提示

- **GIVEN** 同一业务弹层分别运行在 H5 与微信小程序
- **WHEN** 两端触发相同的全局 Toast
- **THEN** 两端的 Toast 均完整显示在弹层上方

