import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LogsService } from '../../services/logs.service';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'logs',
    imports: [CommonModule, MatTableModule],
    templateUrl: './logs.component.html',
})
export class LogComponent implements OnInit {
    @Output() cancelEventEmiter = new EventEmitter();
    displayedColumnsLogs: string[] = ['log', 'acciones'];
    dataSourceLogs: string[] = [];
    isLoading = false;

    constructor(private logService: LogsService) {}

    ngOnInit(): void {
        this.cargarLogs();
    }

    cargarLogs(): void {
        this.isLoading = true;
        this.logService.getLogs().subscribe({
            next: (logs) => {
                this.dataSourceLogs = logs;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    descargar(log: string): void {
        this.logService.descargarLogPorFecha(log).subscribe((data: Blob) => {
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${log}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.cancelEventEmiter.emit();
        });
    }

    onCancel(): void {
        this.cancelEventEmiter.emit();
    }
}
