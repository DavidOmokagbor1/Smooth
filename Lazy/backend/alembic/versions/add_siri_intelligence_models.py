"""Add Siri-like intelligence models

Revision ID: siri_intelligence_001
Revises: 29533358ef5c
Create Date: 2025-12-03 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON


# revision identifiers, used by Alembic.
revision: str = 'siri_intelligence_001'
down_revision: Union[str, None] = '29533358ef5c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create conversation_history table
    op.create_table('conversation_history',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('user_input', sa.String(), nullable=False),
        sa.Column('ai_response', sa.String(), nullable=True),
        sa.Column('transcript', sa.String(), nullable=True),
        sa.Column('emotional_state', JSON(), nullable=True),
        sa.Column('extracted_tasks', JSON(), nullable=True),
        sa.Column('session_id', sa.String(), nullable=True),
        sa.Column('reasoning_context', JSON(), nullable=True),
        sa.Column('follow_up_needed', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversation_history_id'), 'conversation_history', ['id'], unique=False)
    op.create_index(op.f('ix_conversation_history_user_id'), 'conversation_history', ['user_id'], unique=False)
    op.create_index(op.f('ix_conversation_history_session_id'), 'conversation_history', ['session_id'], unique=False)
    op.create_index(op.f('ix_conversation_history_created_at'), 'conversation_history', ['created_at'], unique=False)
    
    # Create user_behavior_patterns table
    op.create_table('user_behavior_patterns',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('pattern_type', sa.String(), nullable=False),
        sa.Column('pattern_key', sa.String(), nullable=False),
        sa.Column('pattern_value', JSON(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('frequency', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('time_of_day', sa.String(), nullable=True),
        sa.Column('day_of_week', sa.String(), nullable=True),
        sa.Column('first_observed', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('last_observed', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_behavior_patterns_id'), 'user_behavior_patterns', ['id'], unique=False)
    op.create_index(op.f('ix_user_behavior_patterns_user_id'), 'user_behavior_patterns', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_behavior_patterns_pattern_type'), 'user_behavior_patterns', ['pattern_type'], unique=False)
    op.create_index(op.f('ix_user_behavior_patterns_pattern_key'), 'user_behavior_patterns', ['pattern_key'], unique=False)
    
    # Create proactive_suggestions table
    op.create_table('proactive_suggestions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('suggestion_type', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('suggested_action', sa.String(), nullable=True),
        sa.Column('reasoning', sa.String(), nullable=True),
        sa.Column('related_tasks', JSON(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('shown', sa.String(), nullable=False, server_default='false'),
        sa.Column('shown_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_proactive_suggestions_id'), 'proactive_suggestions', ['id'], unique=False)
    op.create_index(op.f('ix_proactive_suggestions_user_id'), 'proactive_suggestions', ['user_id'], unique=False)
    op.create_index(op.f('ix_proactive_suggestions_expires_at'), 'proactive_suggestions', ['expires_at'], unique=False)
    op.create_index(op.f('ix_proactive_suggestions_created_at'), 'proactive_suggestions', ['created_at'], unique=False)


def downgrade() -> None:
    # Drop proactive_suggestions table
    op.drop_index(op.f('ix_proactive_suggestions_created_at'), table_name='proactive_suggestions')
    op.drop_index(op.f('ix_proactive_suggestions_expires_at'), table_name='proactive_suggestions')
    op.drop_index(op.f('ix_proactive_suggestions_user_id'), table_name='proactive_suggestions')
    op.drop_index(op.f('ix_proactive_suggestions_id'), table_name='proactive_suggestions')
    op.drop_table('proactive_suggestions')
    
    # Drop user_behavior_patterns table
    op.drop_index(op.f('ix_user_behavior_patterns_pattern_key'), table_name='user_behavior_patterns')
    op.drop_index(op.f('ix_user_behavior_patterns_pattern_type'), table_name='user_behavior_patterns')
    op.drop_index(op.f('ix_user_behavior_patterns_user_id'), table_name='user_behavior_patterns')
    op.drop_index(op.f('ix_user_behavior_patterns_id'), table_name='user_behavior_patterns')
    op.drop_table('user_behavior_patterns')
    
    # Drop conversation_history table
    op.drop_index(op.f('ix_conversation_history_created_at'), table_name='conversation_history')
    op.drop_index(op.f('ix_conversation_history_session_id'), table_name='conversation_history')
    op.drop_index(op.f('ix_conversation_history_user_id'), table_name='conversation_history')
    op.drop_index(op.f('ix_conversation_history_id'), table_name='conversation_history')
    op.drop_table('conversation_history')

