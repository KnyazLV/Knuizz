// src/components/ui/FloatingQuestionMark.tsx
import { Text } from '@radix-ui/themes';

type FloatingQuestionMarkProps = {
    size?: string;
    top?: string;
    left?: string;
    right?: string;
    rotation?: number;
    floatDuration?: string;
};

export default function FloatingQuestionMark({
                                                 size = '4rem',
                                                 top,
                                                 left,
                                                 right,
                                                 rotation = 0,
                                                 floatDuration = '8s',
                                             }: FloatingQuestionMarkProps) {

    const style = {
        '--initial-rotation': `${rotation}deg`,

        position: 'absolute',
        top,
        left,
        right,
        fontSize: size,
        color: 'var(--slate-a5)',
        zIndex: 0,

        animation: `float ${floatDuration} ease-in-out infinite`,

        userSelect: 'none',
        WebkitUserSelect: 'none', // Safari
        MozUserSelect: 'none',    // Firefox
        msUserSelect: 'none',     // Internet Explorer/Edge

    } as React.CSSProperties;

    return (
        <Text as="div" style={style}>
            ?
        </Text>
    );
}
