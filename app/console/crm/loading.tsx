import s from './crm.module.css';

/**
 * SHOWN THE MOMENT A CRM LINK IS CLICKED (D121). Marrs: "If I click from Actions to Deals, it takes at
 * least a couple of seconds." The server still has to fetch the page, but the click now answers at
 * once with the page's outline instead of sitting on the old screen, and Next can prefetch up to this
 * point when a link scrolls into view.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className={s.head}>
        <div className={s.skelTitle} />
      </div>
      <div className={s.tiles}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${s.tile} ${s.skel}`} />
        ))}
      </div>
      <div className={s.cards}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`${s.card} ${s.skel}`} />
        ))}
      </div>
    </div>
  );
}
