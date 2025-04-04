"""images table

Revision ID: 092f57a4a368
Revises: db4e5a7ff9eb
Create Date: 2025-03-30 11:49:03.497416

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '092f57a4a368'
down_revision = 'db4e5a7ff9eb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('images',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('s3_url', sa.String(length=256), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('images')
    # ### end Alembic commands ###
