import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InsertResult } from "typeorm/query-builder/result/InsertResult";

import { StockDataRetrievalJobDto } from "../../proxy.core/dto/request/stock-data-retrieval-job.dto";
import { ProxyJobLog } from "../entity/proxy.job.log.entity";

@Injectable()
export class ProxyJobLogService {
    constructor(
        @InjectRepository(ProxyJobLog)
        private proxyJobLogRepository: Repository<ProxyJobLog>
    ) {}

    async create(proxyJobLog: ProxyJobLog): Promise<InsertResult> {
        return await this.proxyJobLogRepository.insert(proxyJobLog);
    }

    async findLatestProxyLogs(proxyName: string): Promise<ProxyJobLog[]> {
        return await this.proxyJobLogRepository.find({
            where: {
                proxyUsed: proxyName
            },
            order: {
                updatedAt: -1
            },
            take: 20
        });
    }

    async createJobLogFromStockDataRetrievalJobDto(stockDataRetrievalJobDto: StockDataRetrievalJobDto) {
        const proxyJobLog: ProxyJobLog = new ProxyJobLog(
            stockDataRetrievalJobDto.symbol,
            stockDataRetrievalJobDto.exchange,
            stockDataRetrievalJobDto.interval,
            stockDataRetrievalJobDto.fromDate,
            stockDataRetrievalJobDto.toDate,
            stockDataRetrievalJobDto.proxy,
            "StockDataRetrievalJob"
        );
        await this.create(proxyJobLog);
    }
}
