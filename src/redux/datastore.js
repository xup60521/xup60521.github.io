import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
    name: "data", // name隨意
    initialState: {
        // 初始狀態，左邊list, setting名稱隨意
        blogs: [],
    },
    reducers: {
        // 改變狀態用的函數，一樣隨意
        // 雖然這裡是Object，但之後會自動變成類函數
        setblogs: (state, action) => {
            state.blogs = action.payload
             // state是原有的狀態，這裡取前面的list修改
             // 以此類推，要改setting就用state.setting
            //action是外面傳進來的東西
            //記得用payload把它讀取出來
        }
    }
})

// 將additem匯出，之後才能在其他檔案裡面使用
// 後面會談到要如何使用(與一般function有些差別)
export const { setblogs } = dataSlice.actions; 
// default匯出，之後能用任何名子匯入
export default dataSlice.reducer;