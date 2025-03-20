"""set sightings name non unique

Revision ID: 19ab597473dd
Revises: 19d4c061ff08
Create Date: 2025-03-19 21:40:26.185587

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '19ab597473dd'
down_revision = '19d4c061ff08'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('sightings', schema=None) as batch_op:
        batch_op.drop_constraint('sightings_name_key', type_='unique')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('sightings', schema=None) as batch_op:
        batch_op.create_unique_constraint('sightings_name_key', ['name'])

    # ### end Alembic commands ###
