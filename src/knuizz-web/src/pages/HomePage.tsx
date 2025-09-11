// src/pages/HomePage.tsx
import { Heading, Text, Button } from '@radix-ui/themes';

export default function HomePage() {
    return (
        <div style={{height:1000}} className="flex flex-col items-center justify-center h-full text-center">
            <Text as="p" size="5" align="center" className="uppercase">Викторина</Text>
            <Heading className={`text-gradient uppercase`} size="9" align="center" mb="4">Испытай свою эрудицию</Heading>
            <div className="mt-8">
                <Button size="4">
                    Начать игру
                </Button>
            </div>
        </div>
    );
}
