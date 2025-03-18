import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { categoryLightDto } from '../dto/categoryDto';

interface FilterState {
  selectedCategories: categoryLightDto[],
  searchInput: string 
}

const initialState: FilterState = {
  selectedCategories: [],
  searchInput: ''
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<categoryLightDto[]>) {
      state.selectedCategories = action.payload;
    },
    clearFilter(state) {
      state.searchInput = '';
      state.selectedCategories = [];
    },
    addCategory(state, action: PayloadAction<categoryLightDto>) {
      if(!state.selectedCategories.includes(action.payload)){
        state.selectedCategories.push(action.payload);
      }
    },
    removeCategory(state, action: PayloadAction<categoryLightDto>){
      let idx = state.selectedCategories.findIndex(ctg => ctg.categoryID === action.payload.categoryID);
      if(idx >= 0 ){
        state.selectedCategories.splice(idx,1);
      }
    },
    setSearch(state, action: PayloadAction<string>){
      state.searchInput = action.payload;
    }
  },
});

export const { setCategories, clearFilter, addCategory, removeCategory, setSearch } = filterSlice.actions;
export default filterSlice.reducer;
