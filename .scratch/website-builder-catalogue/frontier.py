"""Print open, unblocked and unclaimed local Wayfinder tickets; read-only."""
from pathlib import Path
import re

folder = Path(__file__).parent / 'issues'
records = {}
for path in sorted(folder.glob('[0-9][0-9]-*.md')):
    body = path.read_text()
    def value(key):
        match = re.search(rf'^{re.escape(key)}: (.+)$', body, re.M)
        if not match:
            raise ValueError(f'{path.name}: missing {key}')
        return match[1]
    blockers = value('Blocked by')
    records[path.name[:2]] = {
        'path': path, 'title': body.splitlines()[0].removeprefix('# '),
        'status': value('Status'), 'assignee': value('Assignee'),
        'blockers': [] if blockers == 'none' else blockers.split(', '),
    }

def visit(ticket_id, trail):
    if ticket_id not in records:
        raise ValueError(f'Missing blocker: {ticket_id}')
    if ticket_id in trail:
        raise ValueError(f'Dependency cycle: {trail + [ticket_id]}')
    for blocker in records[ticket_id]['blockers']:
        visit(blocker, trail + [ticket_id])

for ticket_id, record in records.items():
    visit(ticket_id, [])
    if record['status'] == 'open' and record['assignee'] == 'unassigned' and all(
        records[blocker]['status'] in ('resolved', 'closed')
        for blocker in record['blockers']
    ):
        print(f"[{record['title']}](issues/{record['path'].name})")
