import { configureStore } from "@reduxjs/toolkit";
// 因為剛剛是default匯出，現在用任何名子匯入都行
import dataReducer from "./datastore"

// 這裡還是default匯出
export default configureStore({

    reducer: {
        // 這裡要用上面name欄位取的名子
        data: dataReducer
    }
});