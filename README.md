# Whatsapp Text Message Formatter

[![npm version](https://badge.fury.io/js/react-whatsapp-text-formatter.svg)](https://www.npmjs.com/package/react-whatsapp-text-formatter) [![NPM License](https://img.shields.io/npm/l/react-whatsapp-text-formatter)](./LICENSE)


WhatsApp uses a [markdown-like syntax in defining its formatting](https://faq.whatsapp.com/539178204879377/). This library provides an easy-to-use widget that renders WhatsApp-style message string into a formatted format that handles WhatsApp inline styles `` *bold* _italics_ `monospace` ~strikethrough~ `` and multiline codeblock (triple backtick - ` ``` `).

The default renderers for each formatting components doesn't implement any additional styling apart from its HTML tags in order not to interfere with styling, and the library does not have any dependencies apart from `react`.

## Usage

Call the widget in your code,

```tsx
import WhatsAppTextMsgFormatter from 'react-whatsapp-text-formatter'

const MyComponent = () => {
    const text =
        'This is an example text with *bold* and _italics_ formatting, with _some nested ~text~ inbetween_ the formatting.'
    return <WhatsAppTextMsgFormatter text={text} />
}
```

For additional flexibility (such as usage in React Native), these `props` can be used to further customize the component:

-   `boldRender`: renderer for `*bold text*`, defaults to HTML `strong`
-   `italicsRender`: renderer for `_italics text_`, defaults to HTML `em`
-   `strikethroughRender`: renderer for `~strikethrough text~`, defaults to HTML `s`
-   `monoRender`: renderer for `` `mono text` ``, defaults to HTML `code`
-   `monoBlockRender`: renderer for ` ```codeblock text``` `, defaults to HTML `pre`
-   `lineBreakElement`: renderer for new lines, defaults to `<br/>`

## Attribution

This widget is authored with assistence of Gemini/AI.