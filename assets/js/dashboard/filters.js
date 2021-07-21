import React, { Fragment, useState } from 'react';
import { Link, withRouter } from 'react-router-dom'
import { AdjustmentsIcon, PlusIcon } from '@heroicons/react/solid'
import { appliedFilters, navigateToQuery, removeQueryParam } from './query'
import Datamap from 'datamaps'
import { Menu, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { FILTER_GROUPS, formatFilterGroup } from './stats/modals/filter'

function removeFilter(key, history, query) {
  const newOpts = {
    [key]: false
  }
  if (key === 'goal') { newOpts.props = false }
  navigateToQuery(
    history,
    query,
    newOpts
  )
}

function clearAllFilters(history, query) {
  const newOpts = Object.keys(query.filters).reduce((acc, red) => ({ ...acc, [red]: false }), {});
  navigateToQuery(
    history,
    query,
    newOpts
  );
}

function filterText(key, value, query) {
  if (key === "goal") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Completed goal <b>{value}</b></span>
  }
  if (key === "props") {
    const [metaKey, metaValue] = Object.entries(value)[0]
    const eventName = query.filters["goal"] ? query.filters["goal"] : 'event'
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">{eventName}.{metaKey} is <b>{metaValue}</b></span>
  }
  if (key === "source") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Source: <b>{value}</b></span>
  }
  if (key === "utm_medium") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">UTM medium: <b>{value}</b></span>
  }
  if (key === "utm_source") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">UTM source: <b>{value}</b></span>
  }
  if (key === "utm_campaign") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">UTM campaign: <b>{value}</b></span>
  }
  if (key === "referrer") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Referrer: <b>{value}</b></span>
  }
  if (key === "screen") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Screen size: <b>{value}</b></span>
  }
  if (key === "browser") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Browser: <b>{value}</b></span>
  }
  if (key === "browser_version") {
    const browserName = query.filters["browser"] ? query.filters["browser"] : 'Browser'
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">{browserName}.Version: <b>{value}</b></span>
  }
  if (key === "os") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Operating System: <b>{value}</b></span>
  }
  if (key === "os_version") {
    const osName = query.filters["os"] ? query.filters["os"] : 'OS'
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">{osName}.Version: <b>{value}</b></span>
  }
  if (key === "country") {
    const allCountries = Datamap.prototype.worldTopo.objects.world.geometries;
    const selectedCountry = allCountries.find((c) => c.id === value) || {properties: {name: value}};
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Country: <b>{selectedCountry.properties.name}</b></span>
  }
  if (key === "page") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Page: <b>{value}</b></span>
  }
  if (key === "entry_page") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Entry Page: <b>{value}</b></span>
  }
  if (key === "exit_page") {
    return <span className="inline-block max-w-2xs md:max-w-xs truncate">Exit Page: <b>{value}</b></span>
  }
}

function renderDropdownFilter(history, [key, value], query) {
  return (
    <Menu.Item key={key}>
      {({ active }) => (
        <div className="px-4 sm:py-2 py-3 md:text-sm leading-tight flex items-center justify-between" key={key + value}>
          {filterText(key, value, query)}
          <b className="ml-1 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-500" onClick={() => removeFilter(key, history, query)}>✕</b>
        </div>
      )}
    </Menu.Item>
  )
}

function filterDropdownOption(site, option) {
  return (
    <Menu.Item key={option}>
      {({ active }) => (
        <Link
          to={{ pathname: `/${encodeURIComponent(site.domain)}/filter/${option}`, search: window.location.search }}
          className={classNames(
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-800 dark:text-gray-300',
            'block px-4 py-2 text-sm font-medium'
          )}
        >
          {formatFilterGroup(option)}
        </Link>
      )}
    </Menu.Item>
  )
}

function DropdownContent({history, site, query, wrapped}) {
  const [addingFilter, setAddingFilter] = useState(false);

  if (wrapped === 0 || addingFilter) {
    return Object.keys(FILTER_GROUPS).map((option) => filterDropdownOption(site, option))
  } else {
    return (
      <>
        <div className="border-b border-gray-200 dark:border-gray-500 px-4 sm:py-2 py-3 md:text-sm leading-tight hover:text-indigo-700 dark:hover:text-indigo-500 hover:cursor-pointer" onClick={() => setAddingFilter(true)}>
          + Add filter
        </div>
        {appliedFilters(query).map((filter) => renderDropdownFilter(history, filter, query))}
        <div className="border-t border-gray-200 dark:border-gray-500 px-4 sm:py-2 py-3 md:text-sm leading-tight hover:text-indigo-700 dark:hover:text-indigo-500 hover:cursor-pointer" onClick={() => clearAllFilters(history, query)}>
          Clear All Filters
        </div>
      </>
    )
  }
}

class Filters extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      wrapped: 1, // 0=unwrapped, 1=waiting to check, 2=wrapped
      viewport: 1080,
      dropdownMode: 'list'
    };

    this.renderDropDown = this.renderDropDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false);
    window.addEventListener('resize', this.handleResize, false);
    document.addEventListener('keyup', this.handleKeyup);

    this.handleResize();
    this.rewrapFilters();
  }

  componentDidUpdate(prevProps, prevState) {
    const { query } = this.props;
    const { viewport, wrapped } = this.state;

    if (JSON.stringify(query) !== JSON.stringify(prevProps.query) || viewport !== prevState.viewport) {
      this.setState({ wrapped: 1 });
    }

    if (wrapped === 1 && prevState.wrapped !== 1) {
      this.rewrapFilters();
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.handleKeyup);
    document.removeEventListener('mousedown', this.handleClick, false);
    window.removeEventListener('resize', this.handleResize, false);
  }

  handleKeyup(e) {
    const {query, history} = this.props

    if (e.ctrlKey || e.metaKey || e.altKey) return

    if (e.key === 'Escape') {
      clearAllFilters(history, query)
    }
  }

  handleResize() {
    this.setState({ viewport: window.innerWidth || 639});
  }

  // Checks if the filter container is wrapping items
  rewrapFilters() {
    let currItem, prevItem, items = document.getElementById('filters');
    const { wrapped, viewport } = this.state;

    // Always wrap on mobile
    if (appliedFilters(this.props.query).length > 0 && viewport <= 768) {
      return this.setState({ wrapped: 2 })
    }

    this.setState({ wrapped: 0 });

    // Don't rewrap if we're already properly wrapped, there are no DOM children, or there is only filter
    if (wrapped !== 1 || !items || appliedFilters(this.props.query).length === 1) {
      return;
    };

    // For every filter DOM Node, check if its y value is higher than the previous (this indicates a wrap)
    [...(items.childNodes)].forEach(item => {
      currItem = item.getBoundingClientRect();
      if (prevItem && prevItem.top < currItem.top) {
        this.setState({ wrapped: 2 });
      }
      prevItem = currItem;
    });
  };

  renderListFilter(history, [key, value], query) {
    return (
      <span key={key} title={value} className="inline-flex bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow text-sm rounded py-2 px-3 mr-2">
        {filterText(key, value, query)} <b className="ml-1 cursor-pointer hover:text-indigo-500" onClick={() => removeFilter(key, history, query)}>✕</b>
      </span>
    )
  }

  renderDropdownButton() {
    if (this.state.wrapped === 2) {
      return (
        <>
          <AdjustmentsIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
          {appliedFilters(this.props.query).length} Filters
        </>
      )
    } else {
      return (
        <>
          <PlusIcon className="-ml-1 mr-1 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
          Add filter
        </>
      )
    }
  }

  renderDropDown() {
    const { history, query, site } = this.props;

    return (
      <Menu as="div" className="md:relative ml-auto">
        {({ open }) => (
          <>
            <div>
              <Menu.Button className="flex items-center text-xs md:text-sm font-medium leading-tight px-3 py-2 cursor-pointer ml-auto text-gray-500 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded">
                {this.renderDropdownButton()}
              </Menu.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
            <Menu.Items
              className="absolute w-full left-0 right-0 md:w-72 md:absolute md:top-auto md:left-auto md:right-0 mt-2 origin-top-right z-10"
            >
              <div
                className="rounded-md shadow-lg  bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5
                font-medium text-gray-800 dark:text-gray-200"
              >
                <DropdownContent history={history} query={query} site={site} wrapped={this.state.wrapped} />
              </div>
            </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    );
  }

  renderFilterList() {
    const { history, query } = this.props;

    if (this.state.wrapped !== 2) {
      return (
        <div id="filters">
          {(appliedFilters(query).map((filter) => this.renderListFilter(history, filter, query)))}
        </div>
      );
    }

    return null
  }

  render() {
    const { wrapped, viewport } = this.state;

    return (
      <>
        { this.renderFilterList() }
        { this.renderDropDown() }
      </>
    )
  }
}

export default withRouter(Filters);
