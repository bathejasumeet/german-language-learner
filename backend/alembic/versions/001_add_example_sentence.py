"""add_example_sentence_to_vocabulary

Revision ID: 001_add_example_sentence
Revises: 
Create Date: 2026-04-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_example_sentence'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add example_sentence column to words table
    op.add_column('words', sa.Column('example_sentence', sa.String(500), nullable=True))


def downgrade() -> None:
    # Remove example_sentence column
    op.drop_column('words', 'example_sentence')
