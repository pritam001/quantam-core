import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { IntervalEnum } from "../common/interfaces/data.interface";
import { ProxyJobLogService } from "../db/service/proxy.job.log.service";
import { StockDataRetrievalJobDto } from "./dto/request/stock-data-retrieval-job.dto";
import { StockDataRetrievalJobResponseDto } from "./dto/response/stock-data-retrieval-job-response.dto";
import { AlphaVantageService } from "./proxies/alphavantage/alphavantage.service";
import { KiteService } from "./proxies/kite/kite.service";
import { MarketStackService } from "./proxies/marketstack/marketstack.service";
import { DataProxyInterface, DataProxyStats } from "./proxies/proxy/data.proxy.interface";
import { ProxyManagerInterface } from "./proxy.manager.interface";

@Injectable()
export class ProxyManagerService implements ProxyManagerInterface {
    private readonly _proxyServices: Record<string, DataProxyInterface>;
    private readonly VALID_INTERVALS = [1, 5, 15, 30, 60, 1440];

    constructor(
        private alphaVantageService: AlphaVantageService,
        private kiteService: KiteService,
        private marketStackService: MarketStackService,
        private proxyJobLogService: ProxyJobLogService
    ) {
        this._proxyServices = {
            alphavantage: alphaVantageService,
            kite: kiteService,
            marketstack: marketStackService
        };
    }

    /**
     * @method getProxies
     *
     * @returns Record<string, DataProxyStats>
     */
    getProxies(): Record<string, DataProxyStats> {
        Logger.log(`ProxyManagerService : getProxies`);
        const proxyStats: Record<string, DataProxyStats> = {};
        for (const proxyName in this._proxyServices) {
            if (this._proxyServices.hasOwnProperty(proxyName)) {
                proxyStats[proxyName] = this._proxyServices[proxyName].getProxyStats();
            }
        }
        return proxyStats;
    }

    /**
     * @method getProxyDetails
     *
     * @param {string} proxyName
     *
     * @returns DataProxyStats
     */
    getProxyDetails(proxyName: string): DataProxyStats {
        Logger.log(`ProxyManagerService : getProxyDetails for proxy with name='${proxyName}'`);
        if (this._proxyServices.hasOwnProperty(proxyName.toLowerCase())) {
            return this._proxyServices[proxyName.toLowerCase()].getProxyStats();
        } else {
            const message = `ProxyManagerService : getProxyDetails : Proxy with name '${proxyName.toLowerCase()}' not found`;
            Logger.warn(`getProxyDetails : ${message} : HttpStatus.BAD_REQUEST`);
            throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * @method createStockDataRetrievalJob
     *
     * Steps:
     *
     * 1. Validate `proxyName` if mentioned in `stockDataRetrievalJobDto`.
     * 2. If validation failed, get a Proxy based on config and preference.
     * 3. Validate `interval` if mentioned in `stockDataRetrievalJobDto`.
     * 4. retrieveStockData based on selected Proxy
     *
     * @param {StockDataRetrievalJobDto} stockDataRetrievalJobDto
     *
     * @returns Promise<StockDataRetrievalJobResponseDto | HttpException>
     */
    async createStockDataRetrievalJob(
        stockDataRetrievalJobDto: StockDataRetrievalJobDto
    ): Promise<StockDataRetrievalJobResponseDto | HttpException> {
        Logger.log(
            `ProxyManagerService : createStockDataRetrievalJob : stockDataRetrievalJobDto ${JSON.stringify(stockDataRetrievalJobDto)}`
        );
        await this.proxyJobLogService.createJobLogFromStockDataRetrievalJobDto(stockDataRetrievalJobDto);

        let proxyName: string | undefined = stockDataRetrievalJobDto.proxy?.toLowerCase();
        if (typeof proxyName === "string" && !this._proxyServices.hasOwnProperty(proxyName)) {
            Logger.warn("ProxyManagerService : createStockDataRetrievalJob : Proxy not found : HttpStatus.BAD_REQUEST");
            throw new HttpException("Proxy not found", HttpStatus.BAD_REQUEST);
        } else if (proxyName === undefined) {
            // TODO: select based on current proxyManagerStats and stockDataRetrievalJobDto
            // TODO: select proxy preference from config
            proxyName = "alphavantage";
        }

        const interval: IntervalEnum | undefined = stockDataRetrievalJobDto.interval;
        if (interval !== undefined && this.VALID_INTERVALS.includes(interval)) {
            return await this._proxyServices[proxyName].retrieveStockData(stockDataRetrievalJobDto);
        } else {
            Logger.warn("ProxyManagerService : createStockDataRetrievalJob : Given interval is invalid : HttpStatus.BAD_REQUEST");
            throw new HttpException("Given interval is invalid", HttpStatus.BAD_REQUEST);
        }
    }
}
