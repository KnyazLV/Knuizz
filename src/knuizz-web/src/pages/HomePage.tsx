// src/pages/HomePage.tsx
import { Heading, Text, Button, Flex, Grid, Section, Link as RadixLink, Strong } from '@radix-ui/themes';
import { RocketIcon, CodeIcon, BarChartIcon, GitHubLogoIcon } from '@radix-ui/react-icons';

export default function HomePage() {
    return (
        <>
            <Section className="min-h-[calc(100vh_-_65px)] flex flex-col items-center justify-center text-center px-6">
                <Heading className="text-gradient uppercase" size="9" align="center" mt="3" mb="4">
                    Испытай свою эрудицию
                </Heading>
                <Text as="p" size="5" align="center" color="gray" mt="4" mb="8" style={{ maxWidth: '600px' }}>
                    Присоединяйтесь к тысячам игроков и проверьте свои знания в самых разных категориях — от науки до поп-культуры.
                </Text>
                <Button size="4" highContrast>
                    Начать игру
                </Button>
            </Section>

            <Section className="bg-gradient-to-b from-transparent to-[var(--slate-2)] py-20 sm:py-24">
                <div className="inner-container">
                    <Flex direction="column" gap="12">
                        <div className="text-center">
                            <Heading size="7">О проекте</Heading>
                            <Text as="p" mt="4" color="gray" size="4">
                                <Strong>Knuizz</Strong> — это pet-проект, созданный для демонстрации навыков веб-разработки. Он полностью с открытым исходным кодом и доступен на{' '}
                                <RadixLink href="https://github.com/KnyazLV/Knuizz" target="_blank" color="purple" highContrast>
                                    GitHub <GitHubLogoIcon className="inline" />
                                </RadixLink>.
                                Проект также предоставляет собственный <Strong>REST API</Strong> для всех желающих интегрировать викторины в свои приложения.
                            </Text>
                        </div>

                        <Grid columns={{ initial: '1', md: '3' }} gap="8">
                            <Flex direction="column" align="center" gap="3" className="text-center">
                                <RocketIcon width="32" height="32" className="text-[var(--accent-9)]" />
                                <Heading size="4">Быстрые раунды</Heading>
                                <Text size="3" color="gray">Играйте в любое время. Один раунд занимает всего несколько минут.</Text>
                            </Flex>
                            <Flex direction="column" align="center" gap="3" className="text-center">
                                <CodeIcon width="32" height="32" className="text-[var(--accent-9)]" />
                                <Heading size="4">Открытый REST API</Heading>
                                <Text size="3" color="gray">Используйте наше API для создания собственных клиентов или ботов.</Text>
                            </Flex>
                            <Flex direction="column" align="center" gap="3" className="text-center">
                                <BarChartIcon width="32" height="32" className="text-[var(--accent-9)]" />
                                <Heading size="4">Отслеживание прогресса</Heading>
                                <Text size="3" color="gray">Следите за своими результатами и поднимайтесь в таблице лидеров.</Text>
                            </Flex>
                        </Grid>
                    </Flex>
                </div>
            </Section>
        </>
    );
}
