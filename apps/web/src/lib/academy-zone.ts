/**
 * Which side of the business an offer, or a page, belongs to.
 *
 * Courses and intake dates used to be advertised everywhere — the home page,
 * the offer bars over every product. The shop is a shop: someone pricing a
 * laptop on a phone was scrolling past four intake adverts to do it. So course
 * offers are shown inside the academy, and shop offers everywhere else, and
 * every rotating strip on the site asks these two questions to decide.
 */

/** Does this link lead into the academy? Courses, classes and the industrial
 *  training placements — everything we teach rather than sell. */
export function isAcademyLink(href: string): boolean {
  return /^\/(learn|academy|internship)(\/|\?|#|$)/.test(href);
}

/** Is the visitor inside the academy right now? */
export function inAcademy(pathname: string | null | undefined): boolean {
  return isAcademyLink(pathname ?? "");
}

/** The offers that belong where the visitor is. Falls back to the whole list
 *  rather than an empty strip, should a side ever have nothing running. */
export function offersFor<T>(list: T[], pathname: string | null | undefined, hrefOf: (o: T) => string): T[] {
  const academy = inAcademy(pathname);
  const mine = list.filter((o) => isAcademyLink(hrefOf(o)) === academy);
  return mine.length > 0 ? mine : list;
}
