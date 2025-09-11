// src/pages/HomePage.tsx
import { Heading, Text, Button } from '@radix-ui/themes';

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Heading size="9" align="center" mb="4">Welcome to Knuizz!</Heading>
            <Text as="p" size="5" align="center" color="gray">
                Your next quiz adventure starts here.
            </Text>
            <div className="mt-8">
                <Button size="4">
                    Начать игру
                </Button>
            </div>
        </div>
    );
}
