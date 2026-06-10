#!/usr/bin/env python3
"""Write the complete index.html for Spice & Ember."""

html = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Spice & Ember</title>
<meta name="description" content="Spice & Ember - Premium fire-crafted dining experience. Smoked meats, grilled specialties, and craft cocktails.">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔥</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;italic&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body class="mobile-redesign">

<!-- TOP NAVBAR (mobile) -->
<header id="top-navbar">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
  <input class="search-bar" type="text" placeholder="Search dishes..." aria-label="Search dishes">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
</header>

<!-- HERO SECTION -->
<section id="hero">
  <img class="hero-bg-img" src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80" alt="Grilled steak with fire" loading="lazy">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-tag">PREMIUM</div>
    <h1 class="hero-title">Where Fire<br>/ <em>Meets Flavor</em></h1>
    <p class="hero-sub">Wood-fired. Spice-crusted. Ember-roasted. Experience dining reimagined through the primal power of flame.</p>
    <div class="hero-dots">
      <span class="hero-dot active"></span>
      <span class="hero-dot"></span>
      <span class="hero-dot"></span>
      <span class="hero-dot"></span>
      <span class="hero-dot"></span>
    </div>
  </div>
  <button class="hero-menu-btn" aria-label="Menu">•••</button>
</section>

<!-- BOTTOM SHEET -->
<div id="bottom-sheet">
  <div class="sheet-handle"></div>

  <!-- Search row -->
  <div class="sheet-search-row">
    <div class="search-input-wrap">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" placeholder="Search dishes..." aria-label="Search dishes">
    </div>
    <button class="heart-btn" aria-label="Favorites">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  </div>

  <!-- Category tabs -->
  <div class="category-tabs">
    <span class="tab active">All</span>
    <span class="tab">Starters</span>
    <span class="tab">Mains</span>
    <span class="tab">Grills</span>
    <span class="tab">Desserts</span>
    <span class="tab">Drinks</span>
  </div>

  <!-- Section header -->
  <div class="section-header-row">
    <h2>Menu</h2>
    <div class="filter-tabs">
      <span class="active">Popular</span>
      <span>New</span>
      <span>Top Rated</span>
    </div>
  </div>

  <!-- Food cards (horizontal scroll) -->
  <div class="food-cards">
    <div class="food-card" onclick="openModal('Grilled Steak','https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80','Wood-fired perfection with herb butter.','₹28',false,4.8,124)">
      <img class="food-card-img" src="https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80" alt="Grilled Steak" loading="lazy">
      <button class="food-card-menu-btn" aria-label="More options">•••</button>
      <div class="food-card-body">
        <p class="food-card-name">Grilled Steak</p>
        <p class="food-card-sub">Wood-fired perfection</p>
        <p class="food-card-price">₹28</p>
      </div>
    </div>
    <div class="food-card" onclick="openModal('Wood-Fired Pizza','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80','Artisan sourdough crust with fresh toppings.','₹18',true,4.6,98)">
      <img class="food-card-img" src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80" alt="Wood-Fired Pizza" loading="lazy">
      <button class="food-card-menu-btn" aria-label="More options">•••</button>
      <div class="food-card-body">
        <p class="food-card-name">Wood-Fired Pizza</p>
        <p class="food-card-sub">Artisan sourdough crust</p>
        <p class="food-card-price">₹18</p>
      </div>
    </div>
    <div class="food-card" onclick="openModal('Smoked Brisket','https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80','12-hour oak-smoked brisket with house BBQ rub.','₹32',false,4.9,234)">
      <img class="food-card-img" src="https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80" alt="Smoked Brisket" loading="lazy">
      <button class="food-card-menu-btn" aria-label="More options">•••</button>
      <div class="food-card-body">
        <p class="food-card-name">Smoked Brisket</p>
        <p class="food-card-sub">12-hour oak smoke</p>
        <p class="food-card-price">₹32</p>
      </div>
    </div>
    <div class="food-card" onclick="openModal('Lamb Chops','https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80','Herb-crusted rack of lamb with mint glaze.','₹26',false,4.7,156)">
      <img class="food-card-img" src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80" alt="Lamb Chops" loading="lazy">
      <button class="food-card-menu-btn" aria-label="More options">•••</button>
      <div class="food-card-body">
        <p class="food-card-name">Lamb Chops</p>
        <p class="food-card-sub">Herb-crusted rack</p>
        <p class="food-card-price">₹26</p>
      </div>
    </div>
    <div class="food-card" onclick="openModal('Grilled Salmon','https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80','Citrus herb butter with grilled asparagus.','₹24',false,4.6,178)">
      <img class="food-card-img" src="https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80" alt="Grilled Salmon" loading="lazy">
      <button class="food-card-menu-btn" aria-label="More options">•••</button>
      <div class="food-card-body">
        <p class="food-card-name">Grilled Salmon</p>
        <p class="food-card-sub">Citrus herb butter</p>
        <p class="food-card-price">₹24</p>
      </div>
    </div>
  </div>

  <!-- Full Menu Grid (all categories) -->
  <div class="full-menu-section">
    <h3 class="cat-title">Starters</h3>
    <div class="menu-grid-2col">
      <div class="menu-grid-card" onclick="openModal('Fire-Roasted Shrimp','https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&h=300&fit=crop','Jumbo shrimp charred over open flame, finished with chili-garlic butter and fresh lime.','₹14.99',false,4.8,124)">
        <img src="https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&h=300&fit=crop" alt="Fire-Roasted Shrimp" loading="lazy">
        <div class="mg-body"><p class="mg-name">Fire-Roasted Shrimp</p><p class="mg-price">₹14.99</p></div>
      </div>
      <div class="menu-grid-card" onclick="openModal('Ember-Roasted Bone Marrow','https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=400&h=300&fit=crop','Beef bone marrow roasted with herbs, served with toasted sourdough and pickled shallots.','₹18.99',false,4.9,89)">
        <img src="https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=400&h=300&fit=crop" alt="Ember-Roasted Bone Marrow" loading="lazy">
        <div class="mg-body"><p class="mg-name">Ember-Roasted Bone Marrow</p><p class="mg-price">₹18.99</p></div>
      </div>
      <div class="menu-grid-card" onclick="openModal('Charred Octopus','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop','Tender octopus grilled over charcoal, with smoked paprika aioli and pickled fennel.','₹16.99',false,4.7,67)">
        <img src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop" alt="Charred Octopus" loading="lazy">
        <div class="mg-body"><p class="mg-name">Charred Octopus</p><p class="mg-price">₹16.99</p></div>
      </div>
      <div class="menu-grid-card" onclick="openModal('Smoked Tomato Soup','https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop','Fire-roasted tomatoes slow-smoked with basil, finished with truffle oil.','₹9.99',true,4.5,92)">
        <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop" alt="Smoked Tomato Soup" loading="lazy">
        <div class="mg-body"><p class="mg-name">Smoked Tomato Soup</p><p class="mg-price">₹9.99</p></div>
      </div>
      <div class="menu-grid-card" onclick="openModal('Crispy Calamari','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop','Flash-fried calamari dusted with smoked paprika, served with chipotle aioli.','₹12.99',false,4.6,156)">
        <img src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop" alt="Crispy Calamari" loading="lazy">
        <div class="mg-body"><p class="mg-name">Crispy Calamari</p><p class="mg-price">₹12.99</p></div>
      </div>
      <div class="menu-grid-card" onclick="openModal('Flame-Grilled Halloumi','https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop','Halloumi cheese grilled until golden, drizzled with honey and zaatar spice.','₹11.99',true,4.4,78)">
        <img src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop" alt="Flame-Grilled Halloumi" loading="lazy">
        <div class="mg-body"><p class="mg-name">Flame-Grilled Halloumi</p><p class="mg-price">₹11.99</p></div>
      </div>
    </div>

    <h3 class="cat-title">Mains</h3>
    <div class="menu-grid-2col">
      <div class="menu-grid-card" onclick="openModal('Smoked Brisket','https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop','12-hour oak-smoked brisket with house BBQ rub, served with pickled slaw and cornbread.','₹28.99',false,4.9,234)">
        <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" alt="Smoked Brisket" loading="lazy">
        <div class="mg-body"><p class="mg-name">Smoked Brisket</p><p class="mg-price">₹28.99</p></div>
      </div>
      <div class="menu-grid-card" onclick="openModal('Charcoal-Grilled Ribeye','https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop','14oz prime ribeye seared over mesquite charcoal, with roasted bone marrow butter.','₹38.99',false,4.9,312)">
        <img src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop" alt="Charcoal-Grilled Ribeye" loading="lazy">
        <div class="mg-body"><p class="mg-name">Charcoal-Grilled Ribeye</p><p class="mg-price">₹38.99</p></div>
      </div>
      <div class="menu-grid-card" onclick="openModal('Fire-Roasted Salmon','https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop','Atlantic salmon fillet roasted over cedar plank, with citrus-herb butter and asparagus.','₹26.99',false,4.7,178)">
        <img src="https