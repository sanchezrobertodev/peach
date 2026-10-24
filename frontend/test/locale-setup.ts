// 原有回归夹具以中文文案断言；多语言用例自行选择语言。
localStorage.setItem('peach.locale', 'zh-CN');
Object.defineProperty(navigator, 'languages', { configurable: true, get: () => ['zh-CN'] });
