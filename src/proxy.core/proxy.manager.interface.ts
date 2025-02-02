import { HttpException } from "@nestjs/common";

import { StockDataRetrievalJobDto } from "./dto/request/stock-data-retrieval-job.dto";
import { StockDataRetrievalJobResponseDto } from "./dto/response/stock-data-retrieval-job-response.dto";
import { DataProxyStats } from "./proxies/proxy/data.proxy.interface";

export enum JobTypeEnum {
    HEALTH_CHECK_JOB = "HealthCheckJob",
    STOCK_DATA_RETRIEVAL_JOB = "StockDataRetrievalJob"
}

/**
 * @interface ProxyManagerInterface
 * Used as the service interface for ProxyManagerService
 */
export interface ProxyManagerInterface {
    getProxies(): Promise<Record<string, DataProxyStats>>;
    getProxyDetails(proxyName: string): Promise<DataProxyStats | HttpException>;
    createStockDataRetrievalJob(
        stockDataRetrievalJobDto: StockDataRetrievalJobDto
    ): Promise<StockDataRetrievalJobResponseDto | HttpException>;
}
