"""add_reminder_time_and_missing_fields_to_tasks

Revision ID: 6f7a6b132c06
Revises: siri_intelligence_001
Create Date: 2025-12-03 16:02:11.433613

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f7a6b132c06'
down_revision: Union[str, None] = 'siri_intelligence_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add reminder_time column to tasks table
    op.add_column('tasks', sa.Column('reminder_time', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_tasks_reminder_time'), 'tasks', ['reminder_time'], unique=False)


def downgrade() -> None:
    # Remove reminder_time column and index
    op.drop_index(op.f('ix_tasks_reminder_time'), table_name='tasks')
    op.drop_column('tasks', 'reminder_time')

