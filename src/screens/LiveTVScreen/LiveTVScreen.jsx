/**
 * LiveTVScreen.jsx — Canlı TV ekranı
 *
 * 3-panel layout: CategoryPanel | ChannelList | LivePreview
 *
 * Fokus bölgeleri:
 *   'categories' → CategoryPanel
 *   'channels'   → ChannelList (virtualized)
 *   'preview'    → LivePreview butonları
 *
 * Props:
 *   channels          Array   — [{id, num, name, icon, isLive, categoryId, streamUrl}]
 *   categories        Array   — [{id, name, count}]
 *   isContentFocused  boolean
 *   onExitLeft        () => void — SideMenu'ye geç
 */

import React, { useState, useCallback } from 'react';
import CategoryPanel from '../../components/CategoryPanel/CategoryPanel';
import ChannelList from '../../components/ChannelList/ChannelList';
import LivePreview from '../../components/LivePreview/LivePreview';
import SearchBar from '../../components/SearchBar/SearchBar';
import SortDropdown from '../../components/SortDropdown/SortDropdown';
import './LiveTVScreen.css';

// Performans testi için üretilen devasa JSON dosyası
import mockData from '../../data/mockIptv.json';

export default function LiveTVScreen(props) {
  var channels         = props.channels || mockData.channels;
  var categories       = props.categories || mockData.categories;
  var isContentFocused = props.isContentFocused || false;
  var onExitLeft       = props.onExitLeft;

  // Fokus bölgesi
  var zoneState = useState(props.focusZone || 'channels');
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
  var catFocusState = useState(props.focusedCatIndex !== undefined ? props.focusedCatIndex : 1); // 'All' başlangıç (index 1: recently-viewed=0, all=1)
  var catFocusedIndex = props.focusedCatIndex !== undefined ? props.focusedCatIndex : catFocusState[0];
  var setCatFocusedIndex = function(val) {
    catFocusState[1](val);
    if (props.onFocusedCatIndexChange) props.onFocusedCatIndexChange(val);
  };

  // Kanal listesi fokus index
  var chFocusState = useState(props.focusedChIndex !== undefined ? props.focusedChIndex : 0);
  var chFocusedIndex = props.focusedChIndex !== undefined ? props.focusedChIndex : chFocusState[0];
  var setChFocusedIndex = function(val) {
    chFocusState[1](val);
    if (props.onFocusedChIndexChange) props.onFocusedChIndexChange(val);
  };

  // Seçili kanal (preview'da gösterilecek)
  var selectedChState = useState(props.selectedChannel || channels[0] || null);
  var selectedChannel = props.selectedChannel !== undefined ? props.selectedChannel : (selectedChState[0] || channels[0] || null);
  var setSelectedChannel = function(val) {
    selectedChState[1](val);
    if (props.onSelectedChannelChange) props.onSelectedChannelChange(val);
  };

  // Preview buton fokus
  var prevBtnState = useState(0);
  var previewFocusedBtn = prevBtnState[0];
  var setPreviewFocusedBtn = prevBtnState[1];

  // Kategori filtresi uygulanmış kanal listesi
  var filteredChannels = channels;
  if (selectedCategory !== 'all' && selectedCategory !== 'favorite' && selectedCategory !== 'recently-viewed') {
    filteredChannels = channels.filter(function(ch) {
      return ch.categoryId === selectedCategory;
    });
  }

  // Kategori seçim handler
  var handleCategorySelect = useCallback(function(catId) {
    setSelectedCategory(catId);
    setChFocusedIndex(0); // kategori değişince kanal fokusunu sıfırla
  }, []);

  // Kanal seçim handler
  var handleChannelSelect = useCallback(function(channel) {
    if (selectedChannel && selectedChannel.id === channel.id) {
      if (props.onPlay && channel.streamUrl) {
        props.onPlay(channel.streamUrl, channel.name, 'live');
      }
    } else {
      setSelectedChannel(channel);
    }
  }, [selectedChannel, props.onPlay]);

  // Zone geçişleri
  var goToCategories = useCallback(function() { setFocusZone('categories'); }, []);
  var goToChannels   = useCallback(function() { setFocusZone('channels'); }, []);
  var goToPreview    = useCallback(function() { setFocusZone('preview'); }, []);

  var focusedChannel = filteredChannels[chFocusedIndex] || null;

  return (
    <div className="livetv-screen">
      {/* Üst bar */}
      <div className="screen-header">
        <h1 className="screen-header__title">Live</h1>
        <SearchBar placeholder="Search Channels" />
        <div className="screen-header__spacer" />
        <SortDropdown label="Order by number" />
      </div>

      {/* 3-panel body */}
      <div className="livetv-screen__body">
        {/* Sol: Kategori Paneli */}
        <CategoryPanel
          type="livetv"
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          isFocused={isContentFocused && focusZone === 'categories'}
          focusedIndex={catFocusedIndex}
          onFocusChange={setCatFocusedIndex}
          onExitRight={goToChannels}
          onExitLeft={onExitLeft}
        />

        {/* Orta: Kanal Listesi */}
        <ChannelList
          channels={filteredChannels}
          selectedId={selectedChannel ? selectedChannel.id : null}
          focusedIndex={chFocusedIndex}
          isFocused={isContentFocused && focusZone === 'channels'}
          onFocusChange={setChFocusedIndex}
          onSelect={handleChannelSelect}
          onExitLeft={goToCategories}
          onExitRight={goToPreview}
          listHeight={450}
        />

        {/* Sağ: Preview */}
        <LivePreview
          channel={focusedChannel}
          isFocused={isContentFocused && focusZone === 'preview'}
          focusedButton={previewFocusedBtn}
          onFocusChange={setPreviewFocusedBtn}
          onExitLeft={goToChannels}
          onPlay={props.onPlay}
        />
      </div>
    </div>
  );
}
