/**
 * SeriesCategoriesScreen.jsx — Birleşik Diziler Ekranı (2-Panel Layout)
 *
 * Sol: CategoryPanel (Kategoriler)
 * Sağ: SeriesGrid (Diziler)
 *
 * ES5 uyumlu olarak yazılmıştır (WebOS TV uyumluluğu için).
 */

import React, { useState, useEffect, useCallback } from 'react';
import IptvService from '../../services/iptvService';
import CategoryPanel from '../../components/CategoryPanel/CategoryPanel';
import SeriesGrid from '../../components/SeriesGrid/SeriesGrid';
import SearchBar from '../../components/SearchBar/SearchBar';
import SortDropdown from '../../components/SortDropdown/SortDropdown';
import './SeriesCategoriesScreen.css';
import '../../components/SeriesGrid/SeriesGrid.css';

export default function SeriesCategoriesScreen(props) {
  var isContentFocused = props.isContentFocused || false;
  var onSelectSeries   = props.onSelectSeries;
  var onExitLeft       = props.onExitLeft;

  // Fokus bölgesi: 'categories' | 'grid'
  var zoneState = useState(props.focusZone || 'grid');
  var focusZone = props.focusZone !== undefined ? props.focusZone : zoneState[0];
  var setFocusZone = function(val) {
    zoneState[1](val);
    if (props.onFocusZoneChange) props.onFocusZoneChange(val);
  };

  // Kategoriler
  var categoriesState = useState([]);
  var categories = categoriesState[0];
  var setCategories = categoriesState[1];

  var loadingState = useState(true);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  // Seçili Kategori
  var catState = useState(props.selectedCategory || 'all');
  var selectedCategory = props.selectedCategory !== undefined ? props.selectedCategory : catState[0];
  var setSelectedCategory = function(val) {
    catState[1](val);
    if (props.onSelectedCategoryChange) props.onSelectedCategoryChange(val);
  };

  // Kategori Paneli Fokus Index
  var catFocusState = useState(props.focusedCatIndex !== undefined ? props.focusedCatIndex : 1); // 'All' başlangıç (index 1: resume-to=0, all=1)
  var catFocusedIndex = props.focusedCatIndex !== undefined ? props.focusedCatIndex : catFocusState[0];
  var setCatFocusedIndex = function(val) {
    catFocusState[1](val);
    if (props.onFocusedCatIndexChange) props.onFocusedCatIndexChange(val);
  };

  // Dizi Listesi ve Yüklenme Durumu
  var seriesListState = useState([]);
  var seriesList = seriesListState[0];
  var setSeriesList = seriesListState[1];

  var seriesLoadingState = useState(false);
  var isSeriesLoading = seriesLoadingState[0];
  var setIsSeriesLoading = seriesLoadingState[1];

  // Dizi Grid Fokus Index
  var gridFocusState = useState(props.focusedGridIndex !== undefined ? props.focusedGridIndex : 0);
  var gridFocusedIndex = props.focusedGridIndex !== undefined ? props.focusedGridIndex : gridFocusState[0];
  var setGridFocusedIndex = function(val) {
    gridFocusState[1](val);
    if (props.onFocusedGridIndexChange) props.onFocusedGridIndexChange(val);
  };

  // 1. Dizi Kategorilerini Çek (Mount aşamasında)
  useEffect(function() {
    setIsLoading(true);
    var iptvConfig = window.iptvConfig || null;

    IptvService.getSeriesCategories(iptvConfig)
      .then(function(result) {
        setCategories(result || []);
        setIsLoading(false);
      })
      .catch(function(err) {
        console.error('[SeriesCategoriesScreen] Error fetching categories:', err);
        setIsLoading(false);
      });
  }, []);

  // 2. Seçili Kategori Değiştiğinde Dizi Listesini Güncelle
  useEffect(function() {
    setIsSeriesLoading(true);
    var iptvConfig = window.iptvConfig || null;

    IptvService.getSeriesList(iptvConfig, selectedCategory)
      .then(function(result) {
        setSeriesList(result || []);
        setIsSeriesLoading(false);
      })
      .catch(function(err) {
        console.error('[SeriesCategoriesScreen] Error fetching series list:', err);
        setIsSeriesLoading(false);
      });
  }, [selectedCategory]);

  // Kategori Seçim Handler'ı
  var handleCategorySelect = useCallback(function(catId) {
    setSelectedCategory(catId);
    setGridFocusedIndex(0); // yeni kategoriye geçildiğinde odağı sıfırla
  }, []);

  // Zone geçişleri
  var goToCategories = useCallback(function() { setFocusZone('categories'); }, []);
  var goToGrid       = useCallback(function() { setFocusZone('grid'); }, []);

  return (
    <div className="series-category-screen">
      {/* Üst Bar */}
      <div className="screen-header">
        <h1 className="screen-header__title">Diziler</h1>
        <SearchBar placeholder="Dizi Ara..." />
        <div className="screen-header__spacer" />
        <SortDropdown label="Yıla Göre" />
      </div>

      {/* 2-Panel Body */}
      <div className="series-category-screen__body">
        {/* Sol Panel: Kategoriler */}
        {isLoading ? (
          <div style={{ width: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="lazy-image-spinner" style={{ width: '24px', height: '24px' }}></div>
          </div>
        ) : (
          <CategoryPanel
            type="series"
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
            isFocused={isContentFocused && focusZone === 'categories'}
            focusedIndex={catFocusedIndex}
            onFocusChange={setCatFocusedIndex}
            onExitRight={goToGrid}
            onExitLeft={onExitLeft}
          />
        )}

        {/* Sağ Panel: Dizi Grid */}
        {isSeriesLoading ? (
          <div className="screen-center" style={{ flex: 1 }}>
            <div className="lazy-image-spinner" style={{ width: '32px', height: '32px' }}></div>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '10px' }}>Diziler yükleniyor...</p>
          </div>
        ) : seriesList.length === 0 ? (
          <div className="screen-center" style={{ flex: 1 }}>
            <span style={{ fontSize: '2rem' }}>📺</span>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginTop: '10px' }}>Bu kategoride dizi bulunamadı.</p>
          </div>
        ) : (
          <SeriesGrid
            seriesList={seriesList}
            focusedIndex={gridFocusedIndex}
            isFocused={isContentFocused && focusZone === 'grid'}
            onFocusChange={setGridFocusedIndex}
            onSelect={onSelectSeries}
            onExitLeft={goToCategories}
            containerHeight={520}
          />
        )}
      </div>
    </div>
  );
}
