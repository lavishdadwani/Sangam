import User from "./models/user.model.js"
import Order from "./models/order.model.js"
import { ORDER_STATUS } from "./constants/orderStatus.js"
import chalk from "chalk";

export const socketHandler = async (io) => {
    // Get Redis client from io instance
    const getRedis = () => {
        try {
            return io.redis || null;
        } catch (err) {
            return null;
        }
    };

    io.on("connection", (socket) => {
        console.log(chalk.blue(`🔌 Client connected: ${socket.id}`));

        socket.on("identity", async ({userId}) => {
            try{
                const user = await User.findByIdAndUpdate(userId,{
                   socketId:socket.id,
                   isOnline:true 
                },{new:true});
                
                // Store socket-user mapping in Redis for fast lookup
                const redis = getRedis();
                if (redis && user) {
                    try {
                        await redis.set(`socket:user:${socket.id}`, userId.toString(), { EX: 3600 });
                        await redis.set(`user:socket:${userId}`, socket.id, { EX: 3600 });
                        // start of sync orders from DB to Redis
                        // Sync delivery boy's assigned orders from DB to Redis on connection
                        // This prevents DB queries on every location update
                        if (user.role === 'deliveryBoy') {
                            try {
                                const orderIdsKey = `delivery:orders:${userId}`;
                                const existingOrders = await redis.sMembers(orderIdsKey);
                                
                                // Only sync if Redis is empty (first connection or after restart)
                                if (!existingOrders || existingOrders.length === 0) {
                                    console.log(chalk.blue(`🔄 Syncing orders from DB for delivery boy ${userId} on connection...`));
                                    
                                    const orders = await Order.find({
                                        "shopOrders.assignedDeliveryBoy": userId,
                                        "shopOrders.status": { $in: [ORDER_STATUS.AWAITING_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY] }
                                    }).select("_id shopOrders.assignedDeliveryBoy shopOrders.status");
                                    
                                    if (orders && orders.length > 0) {
                                        const dbOrderIds = [];
                                        orders.forEach(order => {
                                            order.shopOrders.forEach(shopOrder => {
                                                if (shopOrder.assignedDeliveryBoy && 
                                                    shopOrder.assignedDeliveryBoy.toString() === userId.toString() &&
                                                    [ORDER_STATUS.AWAITING_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY].includes(shopOrder.status)) {
                                                    dbOrderIds.push(order._id.toString());
                                                }
                                            });
                                        });
                                        
                                        const uniqueOrderIds = [...new Set(dbOrderIds)];
                                        
                                        if (uniqueOrderIds.length > 0) {

                                            if (uniqueOrderIds.length === 1) {
                                                await redis.sAdd(orderIdsKey, uniqueOrderIds[0]);
                                            } else {
                                                await redis.sAdd(orderIdsKey, uniqueOrderIds);
                                            }
                                            await redis.expire(orderIdsKey, 86400); // 24 hours TTL
                                            
                                            console.log(chalk.green(`✅ Synced ${uniqueOrderIds.length} order(s) from DB to Redis for delivery boy ${userId}`));
                                        }
                                    }
                                }
                            } catch (syncErr) {
                                console.error(chalk.red(`❌ Error syncing orders on identity:`, syncErr.message));
                            }
                        }
                        //  the above code is not required as the TTL is 24 hours, and the deliver boy will never take 24hr to deliver the order
                        // end of sync orders from DB to Redis
                    } catch (redisErr) {
                        console.error('Redis identity mapping error:', redisErr);
                    }
                }
            }catch(err){
                console.error('Identity error:', err);
            }
        });

        socket.on("joinOrderRoom", async ({orderId}) => {
            try {
                if (!orderId) {
                    console.log(chalk.yellow(`⚠️  joinOrderRoom called without orderId (Socket: ${socket.id})`));
                    return;
                }
                
                const orderIdStr = orderId.toString();
                const roomName = `order:${orderIdStr}`;
                socket.join(roomName);
                
                console.log(chalk.green(`👤 Socket ${socket.id} joined order room: ${roomName}`));
            } catch (err) {
                console.error('Join order room error:', err);
            }
        });

        socket.on("leaveOrderRoom", async ({orderId}) => {
            try {
                if (!orderId) return;
                
                const roomName = `order:${orderId}`;
                socket.leave(roomName);
                
                console.log(chalk.yellow(`👋 Customer ${socket.id} left order room: ${roomName}`));
            } catch (err) {
                console.error('Leave order room error:', err);
            }
        });

        /**
         * Delivery Partner Location Update
         * Broadcasts to order-specific rooms only x
         */
        socket.on("updateLocation", async ({latitude, longitude, userId}) => {
            try{
                const redis = getRedis();
                
                if (redis) {
                    try {
                        const locationKey = `delivery:location:${userId}`;
                        const locationData = {
                            latitude,
                            longitude,
                            timestamp: Date.now(),
                            socketId: socket.id
                        };
                        
                        await redis.set(locationKey, JSON.stringify(locationData), { EX: 300 });
                        
                        const orderIdsKey = `delivery:orders:${userId}`;
                        let orderIds = await redis.sMembers(orderIdsKey);
                        
                        // Throttled fallback: Only check DB if Redis is empty AND we haven't checked recently
                        // This prevents DB queries on every location update
                        // if (!orderIds || orderIds.length === 0) {
                        //     const lastSyncKey = `delivery:orders:${userId}:lastSync`;
                        //     const lastSync = await redis.get(lastSyncKey);
                        //     const now = Date.now();
                        //     const SYNC_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes
                            
                        //     // last sync more than 5 minutes ago (or never)
                        //     if (!lastSync || (now - parseInt(lastSync)) > SYNC_THROTTLE_MS) {
                        //         console.log(chalk.yellow(`⚠️  Delivery boy ${userId} has no assigned orders in Redis`));
                        //         console.log(chalk.blue(`🔄 Checking database for assigned orders (throttled fallback)...`));
                                
                        //         try {
                        //             const orders = await Order.find({
                        //                 "shopOrders.assignedDeliveryBoy": userId,
                        //                 "shopOrders.status": { $in: [ORDER_STATUS.AWAITING_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY] }
                        //             }).select("_id shopOrders.assignedDeliveryBoy shopOrders.status");
                                    
                        //             if (orders && orders.length > 0) {
                        //                 const dbOrderIds = [];
                        //                 orders.forEach(order => {
                        //                     order.shopOrders.forEach(shopOrder => {
                        //                         if (shopOrder.assignedDeliveryBoy && 
                        //                             shopOrder.assignedDeliveryBoy.toString() === userId.toString() &&
                        //                             [ORDER_STATUS.AWAITING_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY].includes(shopOrder.status)) {
                        //                             dbOrderIds.push(order._id.toString());
                        //                         }
                        //                     });
                        //                 });
                                        
                        //                 const uniqueOrderIds = [...new Set(dbOrderIds)];
                                        
                        //                 if (uniqueOrderIds.length > 0) {
                        //                     if (uniqueOrderIds.length === 1) {
                        //                         await redis.sAdd(orderIdsKey, uniqueOrderIds[0]);
                        //                     } else {
                        //                         await redis.sAdd(orderIdsKey, uniqueOrderIds);
                        //                     }
                        //                     await redis.expire(orderIdsKey, 86400); // 24 hours TTL
                                            
                        //                     await redis.set(lastSyncKey, now.toString(), { EX: 3600 }); // 1 hour TTL
                                            
                        //                     orderIds = uniqueOrderIds;
                        //                     console.log(chalk.green(`✅ Synced ${uniqueOrderIds.length} order(s) from DB to Redis for delivery boy ${userId}`));
                        //                 } else {
                        //                     await redis.set(lastSyncKey, now.toString(), { EX: 3600 });
                        //                     console.log(chalk.yellow(`   No active orders found in DB for delivery boy ${userId}`));
                        //                 }
                        //             } else {
                        //                 await redis.set(lastSyncKey, now.toString(), { EX: 3600 });
                        //                 console.log(chalk.yellow(`   No active orders found in DB for delivery boy ${userId}`));
                        //             }
                        //         } catch (dbErr) {
                        //             console.error(chalk.red(`❌ Error checking DB for assigned orders:`, dbErr.message));
                        //         }
                        //     } else {
                        //         // Recently synced, skip DB query
                        //         console.log(chalk.gray(`⏭️  Skipping DB sync for ${userId} (recently synced)`));
                        //     }
                        // }
                        
                        console.log(chalk.blue(`🔍 Delivery boy ${userId} is assigned to orders:`, orderIds || 'none'));
                        
                        // Broadcast to each order room
                        if (orderIds && orderIds.length > 0) {
                            orderIds.forEach(orderId => {
                                const orderIdStr = orderId.toString();
                                const roomName = `order:${orderIdStr}`;
                                io.to(roomName).emit("updateDeliveryLocation", {
                                    deliveryBoyId: userId,
                                    latitude,
                                    longitude,
                                    timestamp: locationData.timestamp,
                                    orderId: orderIdStr
                                });
                                console.log(chalk.cyan(`📍 Location sent to room ${roomName} for order ${orderIdStr}`));
                            });
                            console.log(chalk.cyan(`✅ Location update sent to ${orderIds.length} order room(s) for delivery boy ${userId}`));
                        } else {
                            console.log(chalk.yellow(`⚠️  Delivery boy ${userId} has no assigned orders (checked both Redis and DB)`));
                        }
                    } catch (redisErr) {
                        console.error('Redis location storage error:', redisErr.message);
                        io.emit("updateDeliveryLocation", {
                            deliveryBoyId: userId,
                            latitude,
                            longitude,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    console.log(chalk.yellow(`⚠️  Redis not available, broadcasting to all clients`));
                    io.emit("updateDeliveryLocation", {
                        deliveryBoyId: userId,
                        latitude,
                        longitude,
                        timestamp: Date.now()
                    });
                }
                
               
                
            }catch(err){
                console.error('Update location error:', err);
            }
        });


        /**
         * Called when: order completed, delivery started, etc.
         */
        socket.on("updateLocationToDB", async ({latitude, longitude, userId}) => {
            try {
                const user = await User.findByIdAndUpdate(userId, {
                    location: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                   },
                   isOnline: true,
                   socketId: socket.id
                }, {new: true});
                
                console.log(chalk.magenta(`💾 Critical: DB updated for delivery boy ${userId}`));
            } catch (err) {
                console.error('DB location update error:', err);
            }
        });

        /**
         * DB Cleanup
         */
        socket.on("disconnect", async () => {
            try{
                const redis = getRedis();
                
                let userId = null;
                if (redis) {
                    try {
                        const userIdStr = await redis.get(`socket:user:${socket.id}`);
                        if (userIdStr) {
                            userId = userIdStr;
                            
                            const user = await User.findById(userId);
                            if (user && user.role === 'deliveryBoy') {
                                await redis.del(`delivery:orders:${userId}`);
                            }
                            
                            // Clean up mappings
                            await redis.del(`socket:user:${socket.id}`);
                            await redis.del(`user:socket:${userId}`);
                        }
                    } catch (redisErr) {
                        console.error('Redis cleanup error:', redisErr);
                    }
                }
                
                await User.findOneAndUpdate({socketId: socket.id}, {
                    socketId: null,
                    isOnline: false
                });
                console.log(chalk.red(`🔌 Client disconnected: ${socket.id}`));
            }catch(err){
                console.error('Disconnect error:', err);
            }
        });
    });
};