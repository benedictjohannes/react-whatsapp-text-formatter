import React, { ReactNode } from 'react'

export interface FormatRendererProps {
    text: string | ReactNode[]
}

export type FormatRenderer = React.FC<FormatRendererProps>

const BoldText: FormatRenderer = ({ text }) => <strong>{text}</strong>
const ItalicsText: FormatRenderer = ({ text }) => <em>{text}</em>
const StrikethroughText: FormatRenderer = ({ text }) => <s>{text}</s>
const MonoText: FormatRenderer = ({ text }) => <code>{text}</code>
const MonoBlock: FormatRenderer = ({ text }) => (
    <pre>
        <code>{text}</code>
    </pre>
)

export interface WhatsAppTextMsgFormatterProps extends FormatRendererProps {
    /** renderer for `*bold text*`, defaults to HTML `strong` */
    boldRender?: FormatRenderer
    /** renderer for `_italics text_`, defaults to HTML `em` */
    italicsRender?: FormatRenderer
    /** renderer for `~strikethrough text~`, defaults to HTML `s` */
    strikethroughRender?: FormatRenderer
    /** renderer for `` `mono text` ``, defaults to HTML `code` */
    monoRender?: FormatRenderer
    /** renderer for ` ```codeblock text``` `, defaults to HTML `pre` */
    monoBlockRender?: FormatRenderer
    /** renderer for new lines, defaults to HTML `<br/>` */
    lineBreakElement?: () => ReactNode
}

interface CharFormatter {
    char: string
    tag: FormatRenderer
}

const defaultCharFormatterMap: {
    [key: string]: FormatRenderer
} = {
    '`': MonoText,
    '*': BoldText,
    _: ItalicsText,
    '~': StrikethroughText,
}

interface ParsedTextNode {
    tag?: FormatRenderer
    text: string
    children?: ParsedTextNode[]
}

const parseWhatsAppText = (
    text: string,
    charFormatterMap: { [key: string]: FormatRenderer }
): ParsedTextNode[] => {
    // Add formatCharsMap parameter
    const elements: ParsedTextNode[] = []
    let currentIndex = 0

    const formatters: CharFormatter[] = Object.entries(charFormatterMap).map(
        ([char, tag]) => ({ char, tag })
    )

    while (currentIndex < text.length) {
        let closestFormatter: CharFormatter | null = null
        let startIndexFound = text.length

        for (const formatter of formatters) {
            const startIndex = text.indexOf(formatter.char, currentIndex)
            if (
                startIndex !== -1 &&
                startIndex < startIndexFound &&
                (startIndex === 0 ||
                    text[startIndex - 1] === ' ' ||
                    text[startIndex - 1] === undefined)
            ) {
                startIndexFound = startIndex
                closestFormatter = formatter
            }
        }

        if (closestFormatter) {
            if (currentIndex < startIndexFound) {
                elements.push({
                    text: text.slice(currentIndex, startIndexFound),
                })
            }

            let endIndex = -1
            for (let i = startIndexFound + 1; i < text.length; i++) {
                if (
                    text[i] === closestFormatter.char &&
                    text[i - 1] !== ' ' &&
                    i - startIndexFound > 1
                ) {
                    endIndex = i
                    break
                }
            }

            if (endIndex !== -1) {
                const formattedText = text.slice(startIndexFound + 1, endIndex)
                const children = parseWhatsAppText(
                    formattedText,
                    charFormatterMap
                )
                elements.push({ tag: closestFormatter.tag, text: '', children })
                currentIndex = endIndex + 1
            } else {
                elements.push({ text: closestFormatter.char })
                currentIndex = startIndexFound + 1
            }
        } else {
            elements.push({ text: text.slice(currentIndex) })
            currentIndex = text.length
        }
    }

    return elements
}

const renderFormattedText = (
    nodes: ParsedTextNode[],
    prevKeyIdx: number
): ReactNode[] =>
    nodes.map((node, i) => {
        const key = prevKeyIdx + 1 + i
        if (node.tag) {
            const textProp: FormatRendererProps = {
                text: node.children
                    ? renderFormattedText(node.children, 0)
                    : node.text,
            }
            return <node.tag key={key} {...textProp} />
        } else {
            return <React.Fragment key={key}>{node.text}</React.Fragment>
        }
    })

const renderWhatsAppPlainMultilineText = (
    multilineText: string,
    charFormatterMap: typeof defaultCharFormatterMap,
    LineBreakElement: () => ReactNode,
    prevKeyIdx: number
) =>
    multilineText.split('\n').map(text => {
        const formatTree = parseWhatsAppText(text, charFormatterMap)
        const elements = renderFormattedText(formatTree, prevKeyIdx)
        return [
            ...elements,
            <LineBreakElement key={prevKeyIdx + elements.length + 1} />,
        ]
    })

const WhatsAppTextMsgFormatter: React.FC<WhatsAppTextMsgFormatterProps> = ({
    text,
    boldRender,
    italicsRender,
    strikethroughRender,
    monoRender,
    monoBlockRender,
    lineBreakElement = () => <br />,
}) => {
    const charFormatterMap: { [key: string]: FormatRenderer } = {
        ...defaultCharFormatterMap,
    }
    if (boldRender) charFormatterMap['*'] = boldRender
    if (italicsRender) charFormatterMap['_'] = italicsRender
    if (strikethroughRender) charFormatterMap['~'] = strikethroughRender
    if (monoRender) charFormatterMap['`'] = monoRender

    if (typeof text !== 'string') {
        return <>{text}</>
    }

    let elements: ReactNode[] = []
    let currentIndex = 0

    while (currentIndex < text.length) {
        const tripleBacktickIndex = text.indexOf('```', currentIndex)

        if (tripleBacktickIndex !== -1) {
            // Process text BEFORE the code block
            if (tripleBacktickIndex > currentIndex) {
                const restText = text.slice(currentIndex, tripleBacktickIndex)
                elements = [
                    ...elements,
                    ...renderWhatsAppPlainMultilineText(
                        restText,
                        charFormatterMap,
                        lineBreakElement,
                        elements.length
                    ),
                ]
            }

            // Process the code block
            let endIndex = tripleBacktickIndex + 3
            while (
                endIndex < text.length &&
                text.indexOf('```', endIndex) !== endIndex
            ) {
                endIndex++
            }

            if (endIndex < text.length) {
                const renderFunc = monoBlockRender || MonoBlock
                elements.push(
                    <pre key={elements.length}>
                        {React.createElement(renderFunc, {
                            text: text.slice(tripleBacktickIndex + 3, endIndex),
                            key: elements.length,
                        })}
                    </pre>
                )
                currentIndex = endIndex + 3
            } else {
                // Unclosed code block
                elements.push('```')
                const restText = text.slice(tripleBacktickIndex + 3)
                elements = [
                    ...elements,
                    ...renderWhatsAppPlainMultilineText(
                        restText,
                        charFormatterMap,
                        lineBreakElement,
                        elements.length
                    ),
                ]
                currentIndex = text.length
            }
        } else {
            // No more code blocks, process the remaining text
            elements = [
                ...elements,
                ...renderWhatsAppPlainMultilineText(
                    text.slice(currentIndex),
                    charFormatterMap,
                    lineBreakElement,
                    elements.length
                ),
            ]
            currentIndex = text.length
        }
    }

    return <>{elements}</>
}

export default WhatsAppTextMsgFormatter
