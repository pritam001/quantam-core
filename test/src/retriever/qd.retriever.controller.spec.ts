import { Test, TestingModule } from "@nestjs/testing";

import { ProxyManagerService } from "../../../src/proxy/proxy.manager.service";
import { QuantamDataRetrieverController } from "../../../src/retriever/qd.retriever.controller";
import { QuantamDataRetrieverService } from "../../../src/retriever/qd.retriever.service";

describe("QuantamCoreController", () => {
    let retrieverController: QuantamDataRetrieverController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [QuantamDataRetrieverController],
            providers: [QuantamDataRetrieverService, ProxyManagerService]
        }).compile();

        retrieverController = app.get<QuantamDataRetrieverController>(QuantamDataRetrieverController);
    });

    describe("root", () => {
        it("should return health of retriever as UP", () => {
            const health = retrieverController.getHealth();
            expect(health).toBeInstanceOf(Object);
            expect(Object.keys(health).includes("status"));
            expect(health["status"]).toBe("OK");
        });
    });
});
