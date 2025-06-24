import { chromium, Page } from "playwright";
import { token, guildId } from "../config";
import { Logger } from "./Logger";

export class Accept {
    public readonly logger: Logger = new Logger()

    private async login(page: Page): Promise<void> {
        await page.goto('https://discord.com/channels/@me')
        await page.evaluate((t: string) => {
            function login(token: string) {
                setInterval(() => {
                    const iframe = document.createElement('iframe')
                    document.body.appendChild(iframe)
                    iframe.contentWindow!.localStorage.token = `"${token}"`
                }, 50)
                setTimeout(() => location.reload(), 2500)
            } login(t)
        }, token)

        await page.waitForTimeout(16000)
        await page.goto(`https://discord.com/channels/${guildId}`)
        await page.waitForTimeout(15000)

        this.logger.success('Login Token And Opened Guild')
    }

    private async openMembers(page: Page): Promise<void> {
        const membersContainer = page.locator(
            'div.containerDefault_c69b6d.wrapper__2ea32', {
                has: page.locator('[data-list-item-id^="channels___members-"]')
            }
        ).first()

        await membersContainer.waitFor({ state: 'visible', timeout: 25000 })
        await membersContainer.scrollIntoViewIfNeeded()
        await membersContainer.click({ timeout: 15000 })

        this.logger.success('Opened Members Panel')

        const pendingTab = page.locator('div.topPill_b3f026 div[role="tab"]').nth(1)
        await pendingTab.waitFor({ state: 'visible', timeout: 10000 })
        await pendingTab.click()

        this.logger.success('Switched To Pending Tab')
    }

    private async acceptLoop(page: Page): Promise<void> {
        while (true) {
            try {
                const dateCell = page.locator('td.mediumCol__71c22').first()
                await dateCell.waitFor({ state: 'visible', timeout: 20000 })
                await dateCell.click({ timeout: 15000 })

                const approveBtn = page.locator('div.actionButton__6b102[role="button"]').first()
                await approveBtn.waitFor({ state: 'visible', timeout: 15000 })
                await approveBtn.scrollIntoViewIfNeeded()
                await approveBtn.click()

                this.logger.log(`Member Accepted!`)
                await page.waitForTimeout(15000)
            } catch (e) {
                await page.waitForTimeout(5000)
            }
        }
    }

    public async run(): Promise<void> {
        console.clear()

        const browser = await chromium.launch({ headless: true })
        const context = await browser.newContext()
        const page = await context.newPage()

        try {
            await this.login(page)
            await this.openMembers(page)
            await this.acceptLoop(page)
        } catch (e) {
            const ts = new Date().toISOString().replace(/[:.]/g, "-")
            const msg = (e as Error).message

            if(!msg.includes('Target page, context or browser has been closed')) {
                this.logger.error(msg)

                try {
                    await page.screenshot({ path: `${process.cwd()}/assets/error/Error_${ts}.png`, fullPage: true })
                } catch {}
            }
        }
    }
}