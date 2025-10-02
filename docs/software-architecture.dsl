workspace "StockVin" "WineInventory"{

    model {
        consumer = person "CONSUMER" "Purchases the distributed product"
        producer = person "PRODUCER" "Manages the wine production process"
        distributor = person "DISTRIBUTOR" "Places and tracks orders"
        payment = softwareSystem "PAYMENT SYSTEM" "Allows you to make payments within the platform."
        StockVin = softwareSystem "WINEINVENTORY SOFTWARE SYSTEM" "Comprehensive solution for managing the wine and pisco production process"{
            landing = container "LANDING PAGE" "First interaction with the platform: explanation of its benefits"
            single = container "SINGLE PAGE APPLICATION" "Application to manage inventories and order functions"
            database = container "DATABASE" "Stores and delivers data to users"
            api = container "API APPLICATION" "Backend logic that connects the SPA with the database"{
                c1 = component "Inventory Controller" ""
                c2 = component "Inventory Management Service" ""
                c3 = component "Inventory Query Service" ""
                c4 = component "Inventory Repository" ""
                c5 = component "Winemaking Controller" ""
                c6 = component "Customer Controller" ""
                c7 = component "Winemaking Query Service" ""
                c8 = component "Winemaking Management Services" ""
                c9 = component "Customer Management Service" ""
                c10 = component "Customer Query Service" ""
                c11 = component "Winemaking Repository" ""
                c12 = component "Customer Repository" ""
                c13 = component "Order Controller" ""
                c14 = component "Order Management Service" ""
                c15 = component "Order Query Service" ""
                c16 = component "Order Repository" ""
            }
        }

        //context
    consumer -> StockVin "uses"
    producer -> StockVin "Manages credentials and profile"
    distributor -> StockVin "Places and tracks sales"
    StockVin -> payment "Retrieves user information to register"

    //container
    consumer -> landing "uses"
    producer -> landing "Manages credentials and profile"
    distributor -> landing "Places and tracks sales"
    producer -> single "Manages services and sales"
    distributor -> single "Buys wines and continues the journey"
    landing -> single "Redirects user to the main application"
    single -> api "Makes API calls"
    api -> database "Reads and writes data"
    api -> payment "Retrieves user information to register"

    //component
    single -> c1 "Makes API calls"
    single -> c5 "Makes API calls"
    single -> c6 "Makes API calls"
    single -> c13 "Makes API calls"
    c1 -> c2 "uses"
    c1 -> c3 "uses"
    c2 -> c4 "uses"
    c3 -> c4 "uses"
    c4 -> database "Reads and writes"
    c5 -> c7 "uses"
    c5 -> c8 "uses"
    c6 -> c9 "uses"
    c6 -> c10 "uses"
    c7 -> c11 "uses"
    c8 -> c11 "uses"
    c9 -> c12 "uses"
    c10 -> c12 "uses"
    c11 -> database "Reads and writes"
    c12 -> database "Reads and writes"
    c13 -> c14 "uses"
    c13 -> c15 "uses"
    c14 -> c16 "uses"
    c15 -> c16 "uses"
    c16 -> database "Reads and writes"
    }



    views {
    systemContext StockVin {
        include *
        //autolayout

    }
    container StockVin {
        include *
        //autolayout
    }
    component api {
        include *
        //autolayout
    }
    theme default

    }
}
