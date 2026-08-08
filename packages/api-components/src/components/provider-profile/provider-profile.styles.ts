import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  /*
   * The article is the grid, and the sections are its items: one gap then spaces the whole
   * profile, including whatever a host slots in, because a slot is display: contents by default
   * and its children become grid items here too. That is also what keeps an unfilled slot from
   * leaving a gap behind it.
   */
  .profile {
    display: grid;
    gap: 1.5rem;
  }

  .header {
    align-items: flex-start;
    display: flex;
    gap: 1rem;

    /*
     * A fixed box, so the header does not reflow once the image lands and so a portrait and a
     * landscape photo occupy the same space. Logical properties throughout (I18N-003).
     */
    .photo {
      block-size: 5rem;
      border-radius: 50%;
      flex: 0 0 auto;
      inline-size: 5rem;
      object-fit: cover;
    }

    .identity {
      display: grid;
      gap: 0.125rem;
      /* Takes the space the actions do not, and without the min the address wraps one word at
       * a time as soon as the photo is showing. */
      flex: 1 1 auto;
      min-inline-size: 0;

      p {
        margin: 0;
      }
    }

    .name {
      font-size: var(--zd-font-size-xl);
      font-weight: var(--zd-font-weight-semibold);
      margin: 0;
    }

    .specialty {
      font-weight: var(--zd-font-weight-semibold);
    }
  }

  /*
   * A rule on each section rather than a divider element between them: it is decoration, and a
   * zd-divider per section would put five more nodes in the accessibility tree saying
   * nothing. Carried by the section rather than sat between two of them so that dropping a
   * section — which is the normal case, not the exception — cannot leave a rule stranded above
   * nothing.
   */
  .section {
    border-block-start: var(--zd-border-width-thin) solid var(--zd-border-secondary);
    padding-block-start: 1.5rem;

    /*
     * Every line in a section is primary text. The instinct is to mute the supporting lines,
     * but the theme's --zd-text-secondary resolves to #919090 — 3.18:1 on white, which fails
     * AA for body copy (A11Y-001). The heading's weight carries the hierarchy instead.
     */
    color: var(--zd-text-primary);

    p {
      margin-block: 0.25rem 0;
    }

    .section-heading {
      font-size: var(--zd-font-size-md);
      font-weight: var(--zd-font-weight-semibold);
      margin: 0 0 0.5rem;
    }

    /*
     * The line breaks the practice typed are kept, which is what pre-line is for — a statement
     * arrives as one string with newlines in it, and collapsing them runs three paragraphs of
     * bedside manner into one block. Wrapping is still the browser's job.
     */
    .statement {
      white-space: pre-line;
    }

    /*
     * The user agent italicises address, which is a convention for a letterhead and not for the
     * one line on the page someone reads while walking to it. The element is here for what it
     * means, not for how it looks by default.
     */
    .contact {
      font-style: normal;
    }

    .list {
      display: grid;
      gap: 0.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    /*
     * Languages read as a run rather than a stack — there are rarely more than three, and a
     * bulleted column of them takes more of the page than the fact deserves. The gap is what
     * separates them, so nothing here has to build "English, Spanish" by concatenation
     * (I18N-004).
     */
    &.languages .list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 1rem;
    }

    /*
     * The number keeps the theme's link treatment; only the tap target grows. WCAG 2.2's target
     * minimum is 24px, which a line of text clears on height alone — this is 2.5rem because a
     * phone number on a profile is the one link on the page someone uses on a phone, one-handed,
     * on the way to the appointment (A11Y-001).
     */
    .phone {
      display: inline-block;
      min-block-size: 2.5rem;
      padding-block: 0.5rem;
    }
  }
`;
