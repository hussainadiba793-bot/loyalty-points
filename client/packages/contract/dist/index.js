import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CDPLYQP7QTYGYVQLEA7RQYY3GVAI423QG5PZP7DVUZVPVCLPGQORJ2XU",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAKYWRkX3BvaW50cwAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAABmFtb3VudAAAAAAABAAAAAA=",
            "AAAAAAAAAAAAAAAKZ2V0X3BvaW50cwAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAABA==",
            "AAAAAAAAAAAAAAANcmVkZWVtX3BvaW50cwAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAQAAAAA"]), options);
        this.options = options;
    }
    fromJSON = {
        init: (this.txFromJSON),
        add_points: (this.txFromJSON),
        get_points: (this.txFromJSON),
        redeem_points: (this.txFromJSON)
    };
}
