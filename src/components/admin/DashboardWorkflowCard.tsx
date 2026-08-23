import { ArrowRight } from 'lucide-react'

import {
  summarizeDashboardAttention,
  type DashboardAttentionItem,
} from '@/components/admin/dashboardAttention'

import './DashboardWorkflowCard.scss'

type DashboardWorkflowCardProps = {
  items: DashboardAttentionItem[]
  label: 'In Review' | 'Scheduled'
}

export function DashboardWorkflowCard({ items, label }: DashboardWorkflowCardProps) {
  const summary = summarizeDashboardAttention(items)
  const headingID = `dashboard-workflow-${label.toLowerCase().replaceAll(' ', '-')}`

  return (
    <section aria-labelledby={headingID} className="dashboard-workflow-card">
      <header className="dashboard-workflow-card__header">
        <span className="dashboard-workflow-card__value">{summary.displayValue}</span>
        <h3 className="dashboard-workflow-card__title" id={headingID}>
          {label}
        </h3>
        <span className="dashboard-workflow-card__state">{summary.stateLabel}</span>
      </header>

      {summary.rows.length > 0 ? (
        <ul className="dashboard-workflow-card__rows">
          {summary.rows.map((item) => (
            <li className="dashboard-workflow-card__row" key={item.label}>
              {item.result.status === 'available' ? (
                <a className="dashboard-workflow-card__link" href={item.href}>
                  <span>{item.label}</span>
                  <span className="dashboard-workflow-card__count">
                    <span>{item.result.value}</span>
                    <ArrowRight aria-hidden="true" size={14} strokeWidth={1.75} />
                  </span>
                </a>
              ) : (
                <div className="dashboard-workflow-card__unavailable">
                  <span>{item.label}</span>
                  <span>Count unavailable</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
