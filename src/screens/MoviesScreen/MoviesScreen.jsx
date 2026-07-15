/**
 * MoviesScreen.jsx — Filmler ekranı
 *
 * 2-panel layout: CategoryPanel | MovieGrid (virtualized)
 *
 * Fokus bölgeleri:
 *   'categories' → CategoryPanel
 *   'grid'       → MovieGrid (2D spatial)
 *
 * Props:
 *   movies            Array   — [{id, title, thumbnail, rating, categoryId}]
 *   categories        Array   — [{id, name, count}]
 *   isContentFocused  boolean
 *   onExitLeft        () => void — SideMenu'ye geç
 */

import React, { useState, useCallback } from 'react';
import CategoryPanel from '../../components/CategoryPanel/CategoryPanel';
import MovieGrid from '../../components/MovieGrid/MovieGrid';
import SearchBar from '../../components/SearchBar/SearchBar';
import SortDropdown from '../../components/SortDropdown/SortDropdown';
import './MoviesScreen.css';

// Demo veri
var DEMO_CATEGORIES = [
  { id: 'news',    name: 'News',    count: 2 },
  { id: 'nature',  name: 'Nature',  count: 2 },
  { id: 'animals', name: 'Animals', count: 2 },
];

var DEMO_MOVIES = [
  { id: 'm1', title: 'Demo News 1',    thumbnail: null, rating: '3.5', categoryId: 'news', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'm2', title: 'Demo News 2',    thumbnail: null, rating: '3.5', categoryId: 'news', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'm3', title: 'Demo Nature 1',  thumbnail: null, rating: '3.5', categoryId: 'nature', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'm4', title: 'Demo Nature 2',  thumbnail: null, rating: '3.5', categoryId: 'nature', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'm5', title: 'Demo Nature 3',  thumbnail: null, rating: '3.5', categoryId: 'nature', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'm6', title: 'Demo Animals 1', thumbnail: null, rating: '3.5', categoryId: 'animals', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'm7', title: 'Demo Animals 2', thumbnail: null, rating: '3.5', categoryId: 'animals', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
];

export default function MoviesScreen(props) {
  var movies           = props.movies || DEMO_MOVIES;
  var categories       = props.categories || DEMO_CATEGORIES;
  var isContentFocused = props.isContentFocused || false;
  var onExitLeft       = props.onExitLeft;

  // Fokus bölgesi
  var zoneState = useState(props.focusZone || 'grid');
  var focusZone = props.focusZone !== undefined ? props.focusZone : zoneState[0];
  var setFocusZone = function(val) {
    zoneState[1](val);
    if (props.onFocusZoneChange) props.onFocusZoneChange(val);
  };

  // Seçili kategori
  var catState = useState(props.selectedCategory || 'all');
  var selectedCategory = props.selectedCategory !== undefined ? props.selectedCategory : catState[0];
  var setSelectedCategory = function(val) {
    catState[1](val);
    if (props.onSelectedCategoryChange) props.onSelectedCategoryChange(val);
  };

  // Kategori paneli fokus index
  var catFocusState = useState(props.focusedCatIndex !== undefined ? props.focusedCatIndex : 1); // 'All' başlangıç (index 1: resume-to=0, all=1)
  var catFocusedIndex = props.focusedCatIndex !== undefined ? props.focusedCatIndex : catFocusState[0];
  var setCatFocusedIndex = function(val) {
    catFocusState[1](val);
    if (props.onFocusedCatIndexChange) props.onFocusedCatIndexChange(val);
  };

  // Grid fokus index
  var gridFocusState = useState(props.focusedGridIndex !== undefined ? props.focusedGridIndex : 0);
  var gridFocusedIndex = props.focusedGridIndex !== undefined ? props.focusedGridIndex : gridFocusState[0];
  var setGridFocusedIndex = function(val) {
    gridFocusState[1](val);
    if (props.onFocusedGridIndexChange) props.onFocusedGridIndexChange(val);
  };

  // Kategori filtresi
  var filteredMovies = movies;
  if (selectedCategory !== 'all' && selectedCategory !== 'favorite' && selectedCategory !== 'resume-to') {
    filteredMovies = movies.filter(function(m) {
      return m.categoryId === selectedCategory;
    });
  }

  // Kategori seçim handler
  var handleCategorySelect = useCallback(function(catId) {
    setSelectedCategory(catId);
    setGridFocusedIndex(0);
  }, []);

  // Zone geçişleri
  var goToCategories = useCallback(function() { setFocusZone('categories'); }, []);
  var goToGrid       = useCallback(function() { setFocusZone('grid'); }, []);

  return (
    <div className="movies-screen">
      {/* Üst bar */}
      <div className="screen-header">
        <h1 className="screen-header__title">Movies</h1>
        <SearchBar placeholder="Search Movies" />
        <div className="screen-header__spacer" />
        <SortDropdown label="Order by number" />
      </div>

      {/* 2-panel body */}
      <div className="movies-screen__body">
        {/* Sol: Kategori Paneli */}
        <CategoryPanel
          type="movies"
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          isFocused={isContentFocused && focusZone === 'categories'}
          focusedIndex={catFocusedIndex}
          onFocusChange={setCatFocusedIndex}
          onExitRight={goToGrid}
          onExitLeft={onExitLeft}
        />

        {/* Sağ: Film Grid */}
        <MovieGrid
          movies={filteredMovies}
          focusedIndex={gridFocusedIndex}
          isFocused={isContentFocused && focusZone === 'grid'}
          onFocusChange={setGridFocusedIndex}
          onExitLeft={goToCategories}
          columns={4}
          containerHeight={560}
          onSelect={function(movie) {
            if (props.onPlay && movie.streamUrl) {
              props.onPlay(movie.streamUrl, movie.title, 'movie');
            }
          }}
        />
      </div>
    </div>
  );
}
