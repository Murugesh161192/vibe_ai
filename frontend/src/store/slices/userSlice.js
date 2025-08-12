import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserProfile, getUserRepositories } from '../../services/api';

/**
 * Initial state for user slice
 */
const initialState = {
  profile: null,
  repositories: [],
  recentSearches: [],
  favoriteUsers: [],
  currentUsername: null,
  isLoadingProfile: false,
  isLoadingRepositories: false,
  profileError: null,
  repositoriesError: null,
  lastFetchTime: null
};

/**
 * Async thunk for fetching user profile
 */
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (username, { rejectWithValue }) => {
    try {
      const response = await getUserProfile(username);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

/**
 * Async thunk for fetching user repositories
 */
export const fetchUserRepositories = createAsyncThunk(
  'user/fetchRepositories',
  async (username, { rejectWithValue }) => {
    try {
      const response = await getUserRepositories(username);
      return response || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch repositories');
    }
  }
);

/**
 * Async thunk for fetching both profile and repositories
 */
export const fetchUserData = createAsyncThunk(
  'user/fetchData',
  async (username, { dispatch }) => {
    // Fetch both in parallel
    const [profileResult, reposResult] = await Promise.allSettled([
      dispatch(fetchUserProfile(username)),
      dispatch(fetchUserRepositories(username))
    ]);

    return {
      profile: profileResult.status === 'fulfilled' ? profileResult.value.payload : null,
      repositories: reposResult.status === 'fulfilled' ? reposResult.value.payload : [],
      profileError: profileResult.status === 'rejected' ? profileResult.reason : null,
      reposError: reposResult.status === 'rejected' ? reposResult.reason : null
    };
  }
);

/**
 * User slice for user-related state
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Set user profile
     */
    setUserProfile: (state, action) => {
      state.profile = action.payload;
      state.currentUsername = action.payload?.login || null;
      state.lastFetchTime = new Date().toISOString();
    },

    /**
     * Set user repositories
     */
    setUserRepositories: (state, action) => {
      state.repositories = action.payload;
    },

    /**
     * Clear user data
     */
    clearUserData: (state) => {
      state.profile = null;
      state.repositories = [];
      state.currentUsername = null;
      state.profileError = null;
      state.repositoriesError = null;
    },

    /**
     * Add to recent searches
     */
    addRecentSearch: (state, action) => {
      const search = {
        username: action.payload,
        timestamp: new Date().toISOString()
      };
      
      // Remove if already exists
      state.recentSearches = state.recentSearches.filter(
        s => s.username !== action.payload
      );
      
      // Add to beginning
      state.recentSearches.unshift(search);
      
      // Keep only last 10
      if (state.recentSearches.length > 10) {
        state.recentSearches.pop();
      }
    },

    /**
     * Remove from recent searches
     */
    removeRecentSearch: (state, action) => {
      state.recentSearches = state.recentSearches.filter(
        s => s.username !== action.payload
      );
    },

    /**
     * Clear recent searches
     */
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },

    /**
     * Add favorite user
     */
    addFavoriteUser: (state, action) => {
      const favorite = {
        username: action.payload.username,
        avatarUrl: action.payload.avatarUrl,
        name: action.payload.name,
        addedAt: new Date().toISOString()
      };
      
      // Check if already exists
      const exists = state.favoriteUsers.some(
        f => f.username === action.payload.username
      );
      
      if (!exists) {
        state.favoriteUsers.push(favorite);
      }
    },

    /**
     * Remove favorite user
     */
    removeFavoriteUser: (state, action) => {
      state.favoriteUsers = state.favoriteUsers.filter(
        f => f.username !== action.payload
      );
    },

    /**
     * Sort repositories
     */
    sortRepositories: (state, action) => {
      const { sortBy, order = 'desc' } = action.payload;
      
      state.repositories.sort((a, b) => {
        let aVal, bVal;
        
        switch (sortBy) {
          case 'stars':
            aVal = a.stargazers_count || 0;
            bVal = b.stargazers_count || 0;
            break;
          case 'forks':
            aVal = a.forks_count || 0;
            bVal = b.forks_count || 0;
            break;
          case 'updated':
            aVal = new Date(a.updated_at || 0).getTime();
            bVal = new Date(b.updated_at || 0).getTime();
            break;
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (order === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    },

    /**
     * Filter repositories
     */
    filterRepositories: (state, action) => {
      const { language, hasIssues, isForked } = action.payload;
      
      let filtered = [...state.repositories];
      
      if (language) {
        filtered = filtered.filter(r => r.language === language);
      }
      
      if (hasIssues !== undefined) {
        filtered = filtered.filter(r => r.has_issues === hasIssues);
      }
      
      if (isForked !== undefined) {
        filtered = filtered.filter(r => r.fork === isForked);
      }
      
      state.repositories = filtered;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchUserProfile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.profile = action.payload;
        state.currentUsername = action.payload?.login || null;
        state.lastFetchTime = new Date().toISOString();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload;
      });

    // Handle fetchUserRepositories
    builder
      .addCase(fetchUserRepositories.pending, (state) => {
        state.isLoadingRepositories = true;
        state.repositoriesError = null;
      })
      .addCase(fetchUserRepositories.fulfilled, (state, action) => {
        state.isLoadingRepositories = false;
        state.repositories = action.payload;
      })
      .addCase(fetchUserRepositories.rejected, (state, action) => {
        state.isLoadingRepositories = false;
        state.repositoriesError = action.payload;
      });

    // Handle fetchUserData
    builder
      .addCase(fetchUserData.fulfilled, (state, action) => {
        const { profile, repositories, profileError, reposError } = action.payload;
        
        if (profile) {
          state.profile = profile;
          state.currentUsername = profile.login;
        }
        
        if (repositories) {
          state.repositories = repositories;
        }
        
        state.profileError = profileError;
        state.repositoriesError = reposError;
        state.lastFetchTime = new Date().toISOString();
      });
  }
});

/**
 * Export actions
 */
export const {
  setUserProfile,
  setUserRepositories,
  clearUserData,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  addFavoriteUser,
  removeFavoriteUser,
  sortRepositories,
  filterRepositories
} = userSlice.actions;

/**
 * Selectors
 */
export const selectUserProfile = (state) => state.user.profile;
export const selectUserRepositories = (state) => state.user.repositories;
export const selectRecentSearches = (state) => state.user.recentSearches;
export const selectFavoriteUsers = (state) => state.user.favoriteUsers;
export const selectCurrentUsername = (state) => state.user.currentUsername;
export const selectIsLoadingProfile = (state) => state.user.isLoadingProfile;
export const selectIsLoadingRepositories = (state) => state.user.isLoadingRepositories;
export const selectProfileError = (state) => state.user.profileError;
export const selectRepositoriesError = (state) => state.user.repositoriesError;

// Computed selectors
export const selectRepositoryLanguages = (state) => {
  const repos = state.user.repositories;
  const languages = new Set();
  repos.forEach(repo => {
    if (repo.language) languages.add(repo.language);
  });
  return Array.from(languages).sort();
};

export const selectRepositoryStats = (state) => {
  const repos = state.user.repositories;
  return {
    total: repos.length,
    totalStars: repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
    totalForks: repos.reduce((sum, r) => sum + (r.forks_count || 0), 0),
    languages: selectRepositoryLanguages(state)
  };
};

export default userSlice.reducer; 