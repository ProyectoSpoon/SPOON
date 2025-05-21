// src/app/dashboard/auditoria/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Badge } from '@/shared/components/ui/Badge'
import { DataTable } from '@/shared/components/ui/Table/table'
import {
  AuditEvent,
  AuditEventType,
  AuditEventSeverity,
  AuditFilter
} from '@/shared/types/audit.types'
import { AuditService } from '@/shared/services/audit.service'
import { Filter, RefreshCw } from 'lucide-react'

const severityColors = {
  [AuditEventSeverity.HIGH]: 'bg-red-100 text-red-800',
  [AuditEventSeverity.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [AuditEventSeverity.LOW]: 'bg-blue-100 text-blue-800',
  [AuditEventSeverity.INFO]: 'bg-gray-100 text-gray-800'
}

const statusColors = {
  'SUCCESS': 'bg-green-100 text-green-800',
  'ERROR': 'bg-red-100 text-red-800',
  'WARNING': 'bg-yellow-100 text-yellow-800'
}

export default function AuditoriaPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<AuditFilter>({})
  const [showFilters, setShowFilters] = useState(false)

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      const result = await AuditService.queryEvents(filter)
      setEvents(result.events)
    } catch (error) {
      console.error('Error cargando logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [filter])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría</h1>
          <p className="text-sm text-muted-foreground">
            Registro de actividades y cambios en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button
            variant="outline"
            onClick={loadAuditLogs}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo de Evento</label>
              <Select
                value={filter.type?.[0]}
                onValueChange={(value) => 
                  setFilter(prev => ({...prev, type: value ? [value as AuditEventType] : undefined}))
                }
              >
                <option value="">Todos</option>
                {Object.values(AuditEventType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Severidad</label>
              <Select
                value={filter.severity?.[0]}
                onValueChange={(value) => 
                  setFilter(prev => ({...prev, severity: value ? [value as AuditEventSeverity] : undefined}))
                }
              >
                <option value="">Todas</option>
                {Object.values(AuditEventSeverity).map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Usuario</label>
              <Input
                placeholder="ID de usuario"
                value={filter.userId || ''}
                onChange={(e) => 
                  setFilter(prev => ({...prev, userId: e.target.value || undefined}))
                }
              />
            </div>
          </div>
        </Card>
      )}

      <Card>
        <DataTable.Root>
          <DataTable.Header>
            <DataTable.Row>
              <DataTable.HeaderCell>Fecha</DataTable.HeaderCell>
              <DataTable.HeaderCell>Tipo</DataTable.HeaderCell>
              <DataTable.HeaderCell>Descripción</DataTable.HeaderCell>
              <DataTable.HeaderCell>Severidad</DataTable.HeaderCell>
              <DataTable.HeaderCell>Estado</DataTable.HeaderCell>
              <DataTable.HeaderCell>Usuario</DataTable.HeaderCell>
            </DataTable.Row>
          </DataTable.Header>
          <DataTable.Body>
            {events.map((event) => (
              <DataTable.Row key={event.id}>
                <DataTable.Cell>
                  {format(
                    new Date(event.metadata.timestamp), 
                    'dd/MM/yyyy HH:mm:ss',
                    { locale: es }
                  )}
                </DataTable.Cell>
                <DataTable.Cell>
                  <Badge variant="outline">
                    {event.type}
                  </Badge>
                </DataTable.Cell>
                <DataTable.Cell>{event.description}</DataTable.Cell>
                <DataTable.Cell>
                  <span className={`px-2 py-1 rounded-full text-xs ${severityColors[event.severity]}`}>
                    {event.severity}
                  </span>
                </DataTable.Cell>
                <DataTable.Cell>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                </DataTable.Cell>
                <DataTable.Cell>
                  {event.metadata.userId || '-'}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
            {events.length === 0 && (
              <DataTable.Row>
                <DataTable.Cell colSpan={6} align="center">
                  <div className="py-8">
                    No hay registros de auditoría para mostrar
                  </div>
                </DataTable.Cell>
              </DataTable.Row>
            )}
          </DataTable.Body>
        </DataTable.Root>
      </Card>
    </div>
  )
}