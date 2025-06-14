from sqlalchemy.orm import Session
import models, schemas

def create_order(db: Session, order: schemas.OrderCreate):
    db_order = models.Order(customer_id=order.customer_id)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    for it in order.items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            article_id=it.article_id,
            quantity=it.quantity
        )
        db.add(db_item)
    db.commit()
    return db_order

def get_orders_by_customer(db: Session, customer_id: int):
    return db.query(models.Order).filter(models.Order.customer_id == customer_id).all()
