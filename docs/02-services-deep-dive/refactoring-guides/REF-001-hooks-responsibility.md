# Refactoring Standard: Hooks by Responsibility
> **Standard ID**: REF-001
> **Based on**: `menu-dia` success (79% LOC reduction)
> **Mandatory for**: Remaining 22 pages

## 🎯 Core Philosophy
Instead of massive `useEffect` chains and monolithic state, logic is split into specialized custom hooks. Each hook manages **one** domain concern.

## 🏗️ The Pattern

### ❌ Before (Monolithic Component)
```tsx
// Page.tsx
const [menu, setMenu] = useState([]);
const [loading, setLoading] = useState(false);
const [filters, setFilters] = useState({});

useEffect(() => {
  // 300 lines of mixed fetching logic
}, []);

const handleSave = () => { ... } // 150 lines
```

### ✅ After (Specialized Hooks)
```tsx
// Page.tsx
const { menu, isLoading } = useMenuData(date);
const { publish } = useMenuPublisher();
const { filters, updateFilter } = useMenuFilters();

if (isLoading) return <Skeleton />;
```

## 🛠️ Implementation Rules

1.  **One Hook per Domain**:
    *   `useproducts.ts`: Fetching & Caching.
    *   `useCart.ts`: Local manipulation (Add/Remove).
    *   `usePersistence.ts`: Save/Sync logic.
2.  **UI Components are Dumb**:
    *   They only receive props.
    *   They never fetch data directly.
3.  **Services Layer**:
    *   Hooks allow calling `services/` directly.
    *   UI never imports `axios` or `fetch`.

## 📉 Success Metrics (menu-dia)
*   **Original Lines**: 1,183
*   **Refactored Lines**: 248
*   **Reduction**: **79%**
*   **Re-renders**: Reduced by 60%

## ⚠️ Migration Steps
1.  Identify state clusters (e.g., all `useState` related to filters).
2.  Extract to a hook file (`useFilters.ts`).
3.  Replace in main component.
4.  Repeat until Page component is under 150 lines.
