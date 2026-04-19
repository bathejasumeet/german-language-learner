"""create_quiz_sessions_table

Revision ID: 002_create_quiz_sessions
Revises: 001_add_example_sentence
Create Date: 2026-04-19 12:05:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '002_create_quiz_sessions'
down_revision = '001_add_example_sentence'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create quiz_sessions table
    op.create_table(
        'quiz_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('vocabulary_ids', sa.Text(), nullable=False),  # JSON array
        sa.Column('answers_json', sa.Text(), nullable=False),     # JSON array
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('total_questions', sa.Integer(), nullable=False),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for query performance
    op.create_index('idx_quiz_sessions_user_id', 'quiz_sessions', ['user_id'])
    op.create_index('idx_quiz_sessions_created', 'quiz_sessions', ['created_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_quiz_sessions_created', table_name='quiz_sessions')
    op.drop_index('idx_quiz_sessions_user_id', table_name='quiz_sessions')
    
    # Drop table
    op.drop_table('quiz_sessions')
