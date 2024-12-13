import React, { useState, useEffect } from 'react'
import '../assets/OrderScreen.css' // Import the new styles
import StickyHeader from './StickyHeader'

const OrderScreen = () => {
  // Initialize state from localStorage or default to empty arrays
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders')
    return savedOrders ? JSON.parse(savedOrders) : { preparing: [], ready: [] }
  })

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api')
        const data = await response.json()
        
        // Process home orders (add to preparing)
        if (data.dataFromHome) {
          setOrders(prevState => {
            const newState = {
              ...prevState,
              preparing: [...new Set([...prevState.preparing, ...data.dataFromHome.map(order => order.orderNum)])]
            }
            return newState
          })
        }

        // Process kitchen orders (move from preparing to ready)
        if (data.dataFromKitchen) {
          data.dataFromKitchen.forEach(order => {
            setOrders(prevState => {
              const newState = {
                preparing: prevState.preparing.filter(id => id !== order.orderNum),
                ready: [...new Set([...prevState.ready, order.orderNum])]
              }
              return newState
            })
          })
        }

        // Process termination orders (remove from ready)
        if (data.dataFromTermination) {
          setOrders(prevState => {
            const newState = {
              ...prevState,
              ready: prevState.ready.filter(id => 
                !data.dataFromTermination.some(order => order.orderNum === id)
              )
            }
            return newState
          })
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
