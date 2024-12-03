import React, { useState, useEffect } from 'react'
import '../assets/OrderScreen.css' // Import the new styles
import StickyHeader from './StickyHeader'

const OrderScreen = () => {
  const [orders, setOrders] = useState({ preparing: [], ready: [] })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api')
        const data = await response.json()
        
        // Process home orders (add to preparing)
        if (data.dataFromHome) {
          setOrders(prevState => ({
            ...prevState,
            preparing: [...new Set([...prevState.preparing, ...data.dataFromHome.map(order => order.orderNum)])]
          }))
        }

        // Process kitchen orders (move from preparing to ready)
        if (data.dataFromKitchen) {
          data.dataFromKitchen.forEach(order => {
            setOrders(prevState => ({
              preparing: prevState.preparing.filter(id => id !== order.orderNum),
              ready: [...new Set([...prevState.ready, order.orderNum])]
            }))
          })
        }

        // Process termination orders (remove from ready)
        if (data.dataFromTermination) {
          setOrders(prevState => ({
            ...prevState,
            ready: prevState.ready.filter(id => 
              !data.dataFromTermination.some(order => order.orderNum === id)
            )
          }))
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    // Set up interval for fetching
    const intervalId = setInterval(fetchData, 2000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <StickyHeader title="Orders Screen" />
      <div className="order-container">
        <h1>Order Status</h1>
        
        <div className="sections-wrapper">
          <section className="section">
            <h2>Preparing</h2>
            <ul className="order-list">
              {orders.preparing.length > 0 ? (
                orders.preparing.map((orderId) => <li key={orderId}>Order #{orderId}</li>)
              ) : (
                <p className="empty-message">No orders currently being prepared</p>
              )}
            </ul>
          </section>

          <section className="section">
            <h2>Ready</h2>
            <ul className="order-list">
              {orders.ready.length > 0 ? (
                orders.ready.map((orderId) => <li key={orderId}>Order #{orderId}</li>)
              ) : (
                <p className="empty-message">No orders ready for pickup</p>
              )}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}

export default OrderScreen
