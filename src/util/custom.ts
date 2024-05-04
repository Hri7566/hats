export function customReply(id: string, message: unknown) {
    MPP.client.sendArray([
        {
            m: "custom",
            target: {
                mode: "id",
                id
            },
            data: message
        }
    ]);
}
