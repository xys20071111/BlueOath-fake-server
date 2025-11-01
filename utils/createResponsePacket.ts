import protobuf from "protobufjs"

const pb = protobuf.loadSync("./raw-protobuf/net_type.proto")
const TResponse = pb.lookupType("net_type.TResponse")

const HEADER_LENGTH = 5;

function createFinalPacket(payload: Uint8Array) {

    const totalPacketLength = HEADER_LENGTH + payload.length;

    const finalBuffer = new ArrayBuffer(totalPacketLength);
    const finalView = new DataView(finalBuffer);

    finalView.setUint32(0, totalPacketLength, false);
    finalView.setUint8(4, 0);

    const finalPacketBytes = new Uint8Array(finalBuffer);
    finalPacketBytes.set(payload, HEADER_LENGTH);

    return finalPacketBytes;
}

export function createResponsePacket(method: string, ret: Uint8Array, callbackHandler: number | null, token: string | null, seq: number) {
    const resData = TResponse.create({
        Err: 0,
        ErrMsg: "",
        Method: method,
        Ret: ret,
        CallbackHandler: callbackHandler,
        Time: Math.round(Date.now() / 1000),
        Token: token,
        Seq: seq,
        IsResponse: 1
    })
    return createFinalPacket(TResponse.encode(resData).finish())
}