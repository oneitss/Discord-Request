import { Accept } from "./util/Accept";

async function main(): Promise<void> {
    const accept = new Accept()
    await accept.run()
}

main().catch(console.error)